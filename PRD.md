# Dining Management App — Product Requirements Document (PRD)

## Project Overview

**Name:** Dining Management App
**Type:** RESTful API + Web Application
**Tech Stack:** Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL, Firebase Auth

---

## 1. Core Functionality

### 1.1 User Management
- **Registration & Auth:** Firebase Auth handles authentication; on registration, user profile is saved to PostgreSQL using Firebase UID as the ID
- **Roles:** `admin`, `manager`, `member`
- **Default Role:** All self-registered users are assigned `member` by default; Admin can update roles
- **Profile:** Name, email, mobile, profile image
- **Soft Delete:** Deleted users are marked `isActive: false`; their historical data (registrations, deposits) is preserved

### 1.2 Meal Schedule Management
- Managers configure a **WeeklyMealTemplate** — specifying which meals (`breakfast`, `lunch`, `dinner`) to auto-generate for each day of the week
- The template is a single global config; updates only affect future generated meals
- Managers trigger **monthly schedule generation** manually — the system creates schedules for the entire month based on the template
- After generation, managers can edit individual schedules (add/remove meals, update weight, menu, availability)
- Each meal within a schedule has a **weight** (cost multiplier, e.g. 1.0, 1.5, 2.0), defaulting to 1.0 at creation
- Meal weights can differ across dates even for the same meal type
- Deleting a schedule cascades — all corresponding meal registrations are deleted

### 1.3 Meal Registration
- Members can register for available meals within a **deadline** window
- Registration uses **upsert** — if a member already has a registration for a meal, the count is updated
- Registration **count per meal per user** can be more than 1 (e.g., a member can register for 3 lunches on a given day); count must be ≥ 1
- Deadlines are fixed per meal type, configurable by managers, and **seeded** on app setup
- Members cannot register or cancel after the deadline
- Managers can register or cancel meals on behalf of any member at any time (deadlines do not apply to managers)
- Cancellation (DELETE) removes the registration record entirely

### 1.4 Deposit Management
- Managers record deposit entries for members throughout the month
- A member can have multiple deposit entries in a month
- Deposits carry over — the balance is cumulative and does not reset monthly
- Members can view their own deposits; Managers/Admins can view all
- Deposits from finalized months cannot be edited or deleted

### 1.5 Expense Logging
- Managers log expenses throughout the month
- Each expense entry contains:
  - Date
  - Amount (must be > 0)
  - Category: `Gas`, `Transport`, `Bazaar`, `Other`
  - Person (name of who spent; may or may not be a registered user — stored as plain text)
  - Description
- Expenses are restricted to Manager/Admin only
- Expenses from finalized months cannot be edited or deleted

### 1.6 Monthly Finalization
- At the end of each month, a manager or admin triggers a **manual finalization**
- Pre-finalization checks (stops at first failure):
  1. Month is not already finalized
  2. At least one expense exists for that month
  3. At least one meal registration exists for that month
- Upon finalization:
  - Total expenses for the month are summed
  - Total weighted meal count across all members is calculated
  - **Meal Rate** = Total Expenses ÷ Total Weighted Meal Count
  - Each member's **meal cost** = their total weighted meal count × meal rate
  - Each member's **balance** is updated: `new balance = previous balance + deposits this month - meal cost`
- Once finalized, the month is **locked** — no changes to meals, registrations, deposits, or expenses for that period are allowed
- Members can view finalized months (their own cost summary); Managers/Admins see the full breakdown

---

## 2. Data Model

### 2.1 User

**Description:** Any person using the platform.

**Attributes:**
- ID (Firebase UID)
- Name
- Email (unique)
- Mobile (optional)
- Role (`admin` / `manager` / `member`)
- Profile image (optional)
- Balance (running balance in currency, carried over across months)
- Is active (boolean, default true — false for soft-deleted users)
- Created date
- Last updated date

**Relationships:**
- A user (member) can have many **MealRegistrations**
- A user (member) can have many **Deposits**
- A user (manager/admin) can log many **Expenses**

---

### 2.2 WeeklyMealTemplate

**Description:** Global config defining which meals to auto-generate for each day of the week.

**Attributes:**
- ID (unique identifier)
- Day of week (`monday` / `tuesday` / `wednesday` / `thursday` / `friday` / `saturday` / `sunday`)
- Meals to generate (array: subset of `breakfast`, `lunch`, `dinner`)
- Updated by (manager user ID)
- Last updated date

---

### 2.3 MealSchedule

**Description:** A date-level record created by a manager. One schedule per calendar date.

**Attributes:**
- ID (unique identifier)
- Date (unique)
- Created by (manager user ID)
- Created date
- Last updated date

**Relationships:**
- Has one or more **ScheduledMeals** (up to 3, one per meal type)

---

### 2.4 ScheduledMeal

**Description:** A specific meal type on a specific date, within a daily schedule.

**Attributes:**
- ID (unique identifier)
- Schedule ID (foreign key → MealSchedule)
- Meal type (`breakfast` / `lunch` / `dinner`)
- Is available (boolean, default true)
- Weight (decimal, default 1.0)
- Menu (optional text description)
- Last updated date

**Relationships:**
- Belongs to one **MealSchedule**
- Can have many **MealRegistrations**

---

### 2.5 MealRegistration

**Description:** A record of a member registering for a specific scheduled meal.

**Attributes:**
- ID (unique identifier)
- Scheduled meal ID (foreign key → ScheduledMeal)
- User ID (member, foreign key)
- Count (integer ≥ 1)
- Registered by (user ID — could be the member themselves or a manager)
- Created date
- Last updated date

**Relationships:**
- Belongs to one **ScheduledMeal**
- Belongs to one **User** (member)

---

### 2.6 Deposit

**Description:** A deposit entry recorded by a manager for a member.

**Attributes:**
- ID (unique identifier)
- User ID (member, foreign key)
- Amount (must be > 0)
- Recorded by (manager user ID)
- Month (YYYY-MM, for finalization scoping)
- Note (optional)
- Date
- Created date

**Relationships:**
- Belongs to one **User** (member)

---

### 2.7 Expense

**Description:** An expense entry logged by a manager.

**Attributes:**
- ID (unique identifier)
- Date
- Amount (must be > 0)
- Category (`Gas` / `Transport` / `Bazaar` / `Other`)
- Person name (plain text)
- Description
- Logged by (manager user ID)
- Month (YYYY-MM, for finalization scoping)
- Created date

---

### 2.8 MealDeadline

**Description:** Global registration/cancellation deadline config per meal type. Seeded on app setup.

**Attributes:**
- ID (unique identifier)
- Meal type (`breakfast` / `lunch` / `dinner`)
- Deadline time (e.g., `22:00`)
- Deadline offset days (integer, e.g. `-1` = previous day)
- Updated by (manager user ID)
- Last updated date

---

### 2.9 MonthlyFinalization

**Description:** A record of a finalized month.

**Attributes:**
- ID (unique identifier)
- Month (YYYY-MM, unique)
- Total expenses
- Total weighted meal count
- Meal rate (calculated)
- Finalized by (user ID)
- Finalized at (timestamp)
- Is locked (boolean)

---

## 3. Relationship Summary

- One **User (member)** → many **MealRegistrations**
- One **User (member)** → many **Deposits**
- One **MealSchedule** → one or more **ScheduledMeals** (max 3)
- One **ScheduledMeal** → many **MealRegistrations**
- One **MealRegistration** → one **ScheduledMeal** + one **User**
- One **MonthlyFinalization** → scopes all **Expenses** and **Deposits** for that month

---

## 4. Business Rules

1. All self-registered users are assigned `member` role by default
2. Only admins can update a user's role
3. Deleted users are soft-deleted (`isActive: false`); historical data is preserved
4. Only managers and admins can create/edit/delete **MealSchedules** and **ScheduledMeals**
5. Each date can have at most one **MealSchedule**
6. Deleting a **MealSchedule** cascades to all its **ScheduledMeals** and their **MealRegistrations**
7. Deleting a **ScheduledMeal** cascades to all its **MealRegistrations**
8. The **WeeklyMealTemplate** is a single global config; changes only affect future month generations
9. Monthly schedule generation is manual and triggered by a manager/admin
10. Only managers and admins can set/update **MealDeadlines**; deadlines are seeded on app setup
11. Members can only register/cancel meals **before the deadline** for that meal type
12. Managers can register/cancel meals for any member at any time (no deadline restriction)
13. Members can only register for meals where `isAvailable = true`
14. Registration uses **upsert** — one record per member per scheduled meal, count updated if exists
15. Registration **count** must be ≥ 1; use DELETE to cancel
16. Only managers and admins can log **Deposits** and **Expenses**
17. Members can view their own deposits and finalization summaries
18. Deposits and expenses from **finalized months** cannot be edited or deleted
19. Monthly finalization is a **manual action** by a manager or admin
20. Pre-finalization checks (stops at first failure): not already finalized → has expenses → has registrations
21. Once finalized, the month is **locked** — no changes allowed
22. Member **balance** is cumulative: `balance += deposits - meal_cost` each month
23. **Meal rate** = total monthly expenses ÷ sum of all weighted registrations across all members
24. Weighted meal count per registration = `count × scheduled_meal_weight`

---

## 5. API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Save user profile to DB after Firebase registration | Public |

### Users
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/users` | Get all users (full profile) | Admin, Manager |
| GET | `/api/v1/users/:id` | Get user by ID (full profile) | Admin, Manager |
| PATCH | `/api/v1/users/me` | Update own profile (name, mobile, image) | Any authenticated user |
| PATCH | `/api/v1/users/:id/role` | Update user role | Admin |
| DELETE | `/api/v1/users/:id` | Soft delete user (`isActive: false`) | Admin |

### Weekly Meal Template
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/templates` | Get current weekly meal template | Manager, Admin |
| PATCH | `/api/v1/templates` | Update weekly meal template | Manager, Admin |

### Meal Schedules
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/schedules/generate` | Generate all schedules for a month based on template | Manager, Admin |
| GET | `/api/v1/schedules` | Get schedules (filterable by date/month) | Public |
| GET | `/api/v1/schedules/:id` | Get schedule by ID (includes scheduled meals) | Public |
| GET | `/api/v1/schedules/:date/registrations` | Get daily registration summary (members + their registrations) | Public |
| DELETE | `/api/v1/schedules/:id` | Hard delete schedule (cascades to meals and registrations) | Manager, Admin |

### Scheduled Meals
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/schedules/:scheduleId/meals` | Add a meal type to an existing schedule | Manager, Admin |
| PATCH | `/api/v1/schedules/:scheduleId/meals/:mealType` | Update meal availability, weight, or menu | Manager, Admin |
| DELETE | `/api/v1/schedules/:scheduleId/meals/:mealType` | Remove a meal from a schedule (cascades to registrations) | Manager, Admin |

### Meal Registrations
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/registrations` | Register (upsert) for a meal | Member (self), Manager/Admin (any user) |
| GET | `/api/v1/registrations` | Get registrations (filterable by user, date, month) | Public |
| PATCH | `/api/v1/registrations/:id` | Update registration count (≥ 1) | Member (self, before deadline), Manager/Admin |
| DELETE | `/api/v1/registrations/:id` | Cancel registration | Member (self, before deadline), Manager/Admin |

### Meal Deadlines
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/deadlines` | Get current deadlines for all meal types | Public |
| PATCH | `/api/v1/deadlines/:mealType` | Update deadline for a meal type | Manager, Admin |

### Deposits
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/deposits` | Record a deposit for a member | Manager, Admin |
| GET | `/api/v1/deposits` | Get deposits (Manager/Admin: all; Member: own only) | Authenticated |
| PATCH | `/api/v1/deposits/:id` | Update deposit (non-finalized months only) | Manager, Admin |
| DELETE | `/api/v1/deposits/:id` | Delete deposit (non-finalized months only) | Manager, Admin |

### Expenses
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/expenses` | Log an expense | Manager, Admin |
| GET | `/api/v1/expenses` | Get expenses (filterable by month, category) | Manager, Admin |
| PATCH | `/api/v1/expenses/:id` | Update expense (non-finalized months only) | Manager, Admin |
| DELETE | `/api/v1/expenses/:id` | Delete expense (non-finalized months only) | Manager, Admin |

### Monthly Finalization
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/finalize` | Finalize a month (with pre-checks) | Manager, Admin |
| GET | `/api/v1/finalize` | Get all finalized months (Member: own summary; Manager/Admin: full) | Authenticated |
| GET | `/api/v1/finalize/:month` | Get finalization details for a month (Member: own cost; Manager/Admin: full breakdown) | Authenticated |

---

## 6. Project Structure

```
src/
├── config/index.ts
├── lib/prisma.ts
├── errors/
│   ├── AppError.ts
│   ├── handlePrismaError.ts
│   ├── handlePrismaValidationError.ts
│   └── handleZodError.ts
├── interface/
│   └── error.ts
├── middlewares/
│   ├── auth.ts
│   ├── globalErrorHandler.ts
│   ├── notFound.ts
│   └── validateRequest.ts
├── modules/
│   ├── Auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.route.ts
│   │   ├── auth.service.ts
│   │   └── auth.validation.ts
│   ├── User/
│   │   ├── user.controller.ts
│   │   ├── user.route.ts
│   │   ├── user.service.ts
│   │   └── user.validation.ts
│   ├── MealTemplate/
│   │   ├── mealTemplate.controller.ts
│   │   ├── mealTemplate.route.ts
│   │   ├── mealTemplate.service.ts
│   │   └── mealTemplate.validation.ts
│   ├── MealSchedule/
│   │   ├── mealSchedule.controller.ts
│   │   ├── mealSchedule.route.ts
│   │   ├── mealSchedule.service.ts
│   │   └── mealSchedule.validation.ts
│   ├── Registration/
│   │   ├── registration.controller.ts
│   │   ├── registration.route.ts
│   │   ├── registration.service.ts
│   │   └── registration.validation.ts
│   ├── Deadline/
│   │   ├── deadline.controller.ts
│   │   ├── deadline.route.ts
│   │   ├── deadline.service.ts
│   │   └── deadline.validation.ts
│   ├── Deposit/
│   │   ├── deposit.controller.ts
│   │   ├── deposit.route.ts
│   │   ├── deposit.service.ts
│   │   └── deposit.validation.ts
│   ├── Expense/
│   │   ├── expense.controller.ts
│   │   ├── expense.route.ts
│   │   ├── expense.service.ts
│   │   └── expense.validation.ts
│   └── Finalization/
│       ├── finalization.controller.ts
│       ├── finalization.route.ts
│       ├── finalization.service.ts
│       └── finalization.validation.ts
├── routes/index.ts
├── utils/
│   ├── catchAsync.ts
│   └── sendResponse.ts
├── app.ts
└── server.ts
```

---

## 7. Technical Specifications

### Environment Variables
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/dbname
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```

### Dependencies
**Production:**
- express, cors, cookie-parser, dotenv
- @prisma/client, pg
- firebase-admin
- zod, http-status

**Development:**
- typescript, ts-node-dev, prisma
- eslint, prettier, @types/*

---

## 8. Response Format

### Success Response
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "meta": { "page": 1, "limit": 10, "total": 100 },
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errorSources": [
    { "path": "field_name", "message": "Specific error" }
  ],
  "stack": "..."
}
```

---

## 9. Deployment Checklist

1. Set `NODE_ENV=production`
2. Configure PostgreSQL (Neon, Supabase, or self-hosted)
3. Configure Firebase project and set environment variables
4. Run `npx prisma generate && npx prisma migrate deploy`
5. Seed meal deadlines and weekly meal template
6. Build: `npm run build`
7. Start: `npm start`