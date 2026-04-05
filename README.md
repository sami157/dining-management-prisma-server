# Dining Management Prisma Server

Backend API for managing a shared dining or meal system with Firebase-authenticated users, role-based access control, monthly accounting, schedule generation, meal registration deadlines, and finalization workflows.

Live API: `https://dining-management-prisma-server.vercel.app/`

## Overview

This server is built around a few core responsibilities:

- Manage users with `ADMIN`, `MANAGER`, and `MEMBER` roles.
- Generate and maintain daily meal schedules from weekly templates.
- Let members register meals within configured deadlines.
- Track deposits and expenses.
- Finalize a month into a locked financial snapshot with per-member settlements.
- Expose operational and public-facing statistics.

Base API prefix: ` /api/v1 `

## Philosophy

This project follows a pragmatic module-first backend structure:

- Each domain lives in its own module with `route`, `controller`, `service`, and `validation` files.
- Controllers stay thin and hand off business rules to services.
- Prisma is the source of truth for persistence and transactional integrity.
- Authentication is delegated to Firebase ID tokens, while authorization is enforced locally from the app database.
- Business rules protect historical accuracy: finalized months are locked and most write operations are blocked after finalization.
- Date-sensitive meal logic is handled in Dhaka time, while data is stored as UTC-compatible values.

## Tech Stack

- Node.js
- TypeScript
- Express 5
- Prisma ORM
- PostgreSQL
- Firebase Admin SDK
- Zod
- CORS
- Cookie Parser
- Vercel-ready deployment script

## Core Domain Concepts

- `User`: application user mapped to a Firebase UID, with role and running balance.
- `WeeklyMealTemplate`: default meal types for each day of the week.
- `MealSchedule`: a calendar date with scheduled meals.
- `ScheduledMeal`: meal instance for a date, with availability, weight, and optional menu.
- `MealRegistration`: member registration against a scheduled meal.
- `Deposit`: money added on behalf of a user and reflected in balance.
- `Expense`: shared dining expense for a month.
- `MealDeadline`: cutoff configuration per meal type.
- `MonthlyFinalization`: locked monthly snapshot containing meal rate and totals.
- `MonthlyMemberSettlement`: per-member settlement rows created during finalization.

## Project Structure

```text
.
|-- prisma/
|   |-- migrations/
|   `-- schema.prisma
|-- src/
|   |-- app.ts
|   |-- server.ts
|   |-- config/
|   |-- errors/
|   |-- interfaces/
|   |-- lib/
|   |   |-- firebaseAdmin.ts
|   |   `-- prisma.ts
|   |-- middlewares/
|   |-- routes/
|   |-- types/
|   |-- utils/
|   `-- modules/
|       |-- Auth/
|       |-- Deadline/
|       |-- Deposit/
|       |-- Expense/
|       |-- Finalization/
|       |-- MealSchedule/
|       |-- MealTemplate/
|       |-- Registration/
|       |-- Stats/
|       `-- User/
|-- firebase/
|-- dist/
|-- vercel.json
`-- package.json
```

## Module Layout

Each module generally follows this pattern:

```text
src/modules/<ModuleName>/
|-- *.route.ts
|-- *.controller.ts
|-- *.service.ts
`-- *.validation.ts
```

Responsibilities:

- `route`: endpoint definitions and middleware wiring
- `controller`: request/response orchestration
- `service`: business logic and database operations
- `validation`: Zod request schemas

## Authentication and Authorization

Authentication flow:

1. Client authenticates with Firebase.
2. Client sends Firebase ID token as `Authorization: Bearer <token>`.
3. Middleware verifies the token with Firebase Admin.
4. The server resolves the matching app user from Prisma by `firebaseUid`.
5. Role-based access is enforced from the local database record.

Supported roles:

- `ADMIN`
- `MANAGER`
- `MEMBER`

Notes:

- A Firebase-authenticated user must also exist in the application database.
- Inactive users are blocked even if their Firebase token is valid.
- Some read routes are public; most write routes require authentication.

## Environment Variables

The server validates environment variables at startup. Use your own values; do not commit secrets.

Required:

- `DATABASE_URL`

Optional:

- `NODE_ENV`
- `PORT`
- `FIREBASE_SERVICE_ACCOUNT_KEY_PATH`
- `FIREBASE_SERVICE_ACCOUNT_BASE64`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Firebase credentials can be provided in one of three ways:

- Base64-encoded service account JSON
- Individual Firebase credential environment variables
- A local service account file path

## Installation and Local Development

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Default local port: `5000`

## Available Scripts

- `npm run dev` - start the development server with watch mode
- `npm run build` - compile TypeScript
- `npm start` - run the compiled server
- `npm run lint` - type-check without emitting files
- `npm run format` - format the project with Prettier
- `npm run vercel-build` - generate Prisma client, run migrations, and build for deployment

## API Routes and Role-Based Access

Role key:

- `Public` = no auth required
- `Any Authenticated` = any valid active app user
- `Admin/Manager` = `ADMIN` or `MANAGER`
- `Admin Only` = `ADMIN`

### Auth

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Upsert a Firebase-authenticated user into the app database as a member by default. |

### Users

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/v1/users` | Admin/Manager | List users. |
| GET | `/api/v1/users/me` | Any Authenticated | Get current user profile. |
| GET | `/api/v1/users/:id` | Admin/Manager | Get one user by ID. |
| PATCH | `/api/v1/users/me` | Any Authenticated | Update own profile fields. |
| PATCH | `/api/v1/users/:id/role` | Admin Only | Change a user's role. |
| PATCH | `/api/v1/users/:id` | Admin/Manager | Update a user. |
| DELETE | `/api/v1/users/:id` | Admin Only | Deactivate a user. |

### Meal Templates

Aliases:

- `/api/v1/meal-templates`
- `/api/v1/templates`

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/v1/meal-templates` | Admin/Manager | Get weekly template configuration. |
| POST | `/api/v1/meal-templates` | Admin/Manager | Create or upsert weekly template configuration. |
| PATCH | `/api/v1/meal-templates` | Admin/Manager | Update weekly template configuration. |

### Meal Schedules

Aliases:

- `/api/v1/meal-schedules`
- `/api/v1/schedules`

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/v1/meal-schedules` | Public | List schedules by date or month. |
| GET | `/api/v1/meal-schedules/:date/registrations` | Public | Get registration summary for a specific date. |
| GET | `/api/v1/meal-schedules/:id` | Public | Get one schedule with meals. |
| POST | `/api/v1/meal-schedules` | Admin/Manager | Create a schedule for a specific date. |
| POST | `/api/v1/meal-schedules/generate` | Admin/Manager | Generate schedules for a month from weekly templates. |
| POST | `/api/v1/meal-schedules/:scheduleId/meals` | Admin/Manager | Add a meal to an existing schedule. |
| PATCH | `/api/v1/meal-schedules/:scheduleId/meals/:mealType` | Admin/Manager | Update a scheduled meal. |
| DELETE | `/api/v1/meal-schedules/:scheduleId/meals/:mealType` | Admin/Manager | Delete a scheduled meal. |
| DELETE | `/api/v1/meal-schedules/:id` | Admin/Manager | Delete a schedule. |

### Meal Registration

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/v1/registrations` | Any Authenticated | List registrations. Members are scoped to their own records. |
| POST | `/api/v1/registrations` | Any Authenticated | Create or upsert a meal registration. Members can act only for themselves. |
| PATCH | `/api/v1/registrations/:id` | Any Authenticated | Update a registration. Members can edit only their own registration. |
| DELETE | `/api/v1/registrations/:id` | Any Authenticated | Delete a registration. Members can delete only their own registration. |

### Meal Deadlines

Aliases:

- `/api/v1/deadline`
- `/api/v1/deadlines`

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/v1/deadlines` | Public | List configured meal deadlines. |
| POST | `/api/v1/deadlines` | Admin/Manager | Create or upsert deadline configuration. |
| PATCH | `/api/v1/deadlines/:mealType` | Admin/Manager | Update deadline for a meal type. |

### Deposits

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/v1/deposits` | Any Authenticated | List deposits. Members are scoped to their own deposits. |
| GET | `/api/v1/deposits/my-total` | Any Authenticated | Get current user's monthly deposit total. |
| POST | `/api/v1/deposits` | Admin/Manager | Record a deposit and increment user balance. |
| PATCH | `/api/v1/deposits/:id` | Admin/Manager | Update a deposit and reconcile balance adjustments. |
| DELETE | `/api/v1/deposits/:id` | Admin/Manager | Delete a deposit and reverse its balance effect. |

### Expenses

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/v1/expenses` | Admin/Manager | List expenses. |
| POST | `/api/v1/expenses` | Admin/Manager | Create an expense. |
| PATCH | `/api/v1/expenses/:id` | Admin/Manager | Update an expense. |
| DELETE | `/api/v1/expenses/:id` | Admin/Manager | Delete an expense. |

### Finalization

Aliases:

- `/api/v1/finalization`
- `/api/v1/finalize`

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/v1/finalization` | Any Authenticated | List monthly finalizations. Members receive only their own summary view. |
| GET | `/api/v1/finalization/:month` | Any Authenticated | Get finalization details for a month. Members receive only their own breakdown. |
| POST | `/api/v1/finalization` | Admin/Manager | Finalize a month and create settlement snapshots. |
| POST | `/api/v1/finalization/:month/rollback` | Admin Only | Roll back a finalized month and reverse settlement balance effects. |

### Stats

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/v1/stats/public` | Public | Public month summary with meal, finance, and highlight data. |
| GET | `/api/v1/stats/daily` | Admin/Manager | Daily operational meal stats. |
| GET | `/api/v1/stats/overview` | Admin/Manager | User and system overview stats. |
| GET | `/api/v1/stats/managers` | Admin/Manager | Active manager directory. |
| GET | `/api/v1/stats/monthly` | Admin/Manager | Full monthly operational stats. |

## Business Rules

- Members can only manage their own meal registrations.
- Meal registrations respect per-meal deadlines.
- A scheduled meal must be available before it can be registered.
- Deposits immediately affect member balance.
- Finalization locks a month and prevents further mutable operations on that period.
- Monthly finalization computes meal rate from:
  `total expenses / total weighted meal count`
- Rollback restores balance deltas from stored settlements.
- Schedule generation skips dates that already have schedules.

## Date and Time Rules

- Business date logic is based on Dhaka time.
- Month values use `YYYY-MM`.
- Date values use `YYYY-MM-DD`.
- Stored schedule and accounting ranges are handled with UTC-safe date boundaries.
- Meal deadlines are derived from schedule date + configured time + offset days.

## Deployment Notes

- The project includes `vercel.json` and a `vercel-build` script.
- Prisma client generation runs during install/build flows.
- Database migrations are expected to run during deployment.

## Security Notes

- Do not commit `.env`, Firebase private keys, or service account JSON.
- Keep service account delivery outside version control.
- Prefer environment-based secret injection in deployment environments.

## Health Check

Root route:

| Method | Route | Description |
|---|---|---|
| GET | `/` | Returns a welcome message. |

## Future Improvements

- Add automated tests for finalization and rollback edge cases.
- Add API documentation with OpenAPI or Swagger.
- Add rate limiting and request logging.
- Add `.env.example` for safer onboarding.
- Add CI checks for formatting, type-checking, and migration validation.
