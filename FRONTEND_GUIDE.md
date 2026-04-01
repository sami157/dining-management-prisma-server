# Frontend Validation and Type Reference

This document is the frontend reference for request validation schemas and TypeScript-friendly payload types used by the Dining Management backend.

Base API URL:

```txt
{BACKEND_BASE_URL}/api/v1
```

Example:

```txt
http://localhost:5000/api/v1
```

## How Backend Validation Works

All validated routes use a Zod schema through `validateRequest()`.

The backend may validate:

- `body`
- `query`
- `params`

Important frontend implications:

- `z.number()` means you must send JSON numbers, not stringified numbers
- optional fields can be omitted entirely
- URL fields must be full valid URLs
- date strings are plain strings, so the frontend should format them exactly as required
- some update routes allow partial payloads
- some update routes reject empty objects even if every field is optional

## Shared String Formats

Use these formats exactly:

- `YYYY-MM` for month values like `2026-04`
- `YYYY-MM-DD` for date values like `2026-04-05`
- `HH:MM` 24-hour format for deadline times like `22:30`

## Auth and Actor Fields

Do not send these fields from the frontend on protected routes:

- `createdById`
- `updatedById`
- `recordedById`
- `loggedById`
- `registeredById`
- `finalizedById`

The backend derives them from the authenticated Firebase user.

## Enums

These are the backend enum values the frontend should reuse.

```ts
export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

export type ExpenseCategory = 'GAS' | 'TRANSPORT' | 'BAZAR' | 'OTHER';

export type DayOfWeek =
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY';
```

## Recommended Frontend Request Types

These types mirror the validated request payloads.

```ts
export type RegisterBody = {
  firebaseUid: string;
  name: string;
  email: string;
  mobile?: string;
  profileImage?: string;
};

export type UpdateOwnProfileBody = {
  name?: string;
  mobile?: string;
  profileImage?: string;
};

export type UpdateUserBody = {
  name?: string;
  email?: string;
  mobile?: string;
  profileImage?: string;
};

export type UpdateUserRoleBody = {
  role: UserRole;
};

export type MealTemplateBody = {
  dayOfWeek: DayOfWeek;
  meals: MealType[];
};

export type DeadlineBody = {
  type: MealType;
  time: string;
  offsetDays: number;
};

export type UpdateDeadlineParams = {
  mealType: MealType;
};

export type UpdateDeadlineBody = {
  time: string;
  offsetDays: number;
};

export type MealDefinition = {
  type: MealType;
  isAvailable?: boolean;
  weight?: number;
  menu?: string;
};

export type CreateScheduleBody = {
  date: string;
  meals: MealDefinition[];
};

export type GenerateSchedulesBody = {
  month: string;
};

export type AddMealBody = MealDefinition;

export type UpdateMealParams = {
  mealType: MealType;
};

export type UpdateMealBody = {
  isAvailable?: boolean;
  weight?: number;
  menu?: string;
};

export type ScheduleQuery = {
  date?: string;
  month?: string;
};

export type UpsertRegistrationBody = {
  scheduledMealId: string;
  userId?: string;
  count: number;
};

export type UpdateRegistrationBody = {
  count: number;
};

export type CreateDepositBody = {
  userId: string;
  amount: number;
  month: string;
  note?: string;
  date?: string;
};

export type UpdateDepositBody = {
  userId?: string;
  amount?: number;
  month?: string;
  note?: string;
  date?: string;
};

export type MonthlyDepositTotalQuery = {
  month: string;
};

export type CreateExpenseBody = {
  date?: string;
  amount: number;
  category: ExpenseCategory;
  personName: string;
  description?: string;
  month: string;
};

export type UpdateExpenseBody = {
  date?: string;
  amount?: number;
  category?: ExpenseCategory;
  personName?: string;
  description?: string;
  month?: string;
};

export type FinalizeMonthBody = {
  month: string;
};
```

## Validation Reference by Route

Only routes wired through `validateRequest()` are listed below.

### `POST /auth/register`

Auth: public

Validated `body`:

```ts
type RegisterBody = {
  firebaseUid: string;
  name: string;
  email: string;
  mobile?: string;
  profileImage?: string;
};
```

Rules:

- `firebaseUid` is required and must be a non-empty string
- `name` is required and must be a non-empty string
- `email` is required and must be a valid email
- `profileImage`, if sent, must be a valid URL

Example:

```json
{
  "firebaseUid": "firebase_uid_from_firebase",
  "name": "John Doe",
  "email": "john@example.com",
  "mobile": "01700000000",
  "profileImage": "https://example.com/photo.jpg"
}
```

### `PATCH /users/me`

Auth: any authenticated user

Validated `body`:

```ts
type UpdateOwnProfileBody = {
  name?: string;
  mobile?: string;
  profileImage?: string;
};
```

Rules:

- `profileImage`, if sent, must be a valid URL
- backend currently allows an empty object

### `PATCH /users/:id/role`

Auth: `ADMIN`

Validated `body`:

```ts
type UpdateUserRoleBody = {
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
};
```

### `PATCH /users/:id`

Auth: `ADMIN`, `MANAGER`

Validated `body`:

```ts
type UpdateUserBody = {
  name?: string;
  email?: string;
  mobile?: string;
  profileImage?: string;
};
```

Rules:

- `email`, if sent, must be a valid email
- `profileImage`, if sent, must be a valid URL
- backend currently allows an empty object

### `PATCH /templates`

Auth: `ADMIN`, `MANAGER`

Same validation is also used by `POST /templates`.

Validated `body`:

```ts
type MealTemplateBody = {
  dayOfWeek: DayOfWeek;
  meals: MealType[];
};
```

Rules:

- `dayOfWeek` must be one of the seven uppercase enum values
- `meals` must contain at least one value
- each meal must be one of `BREAKFAST`, `LUNCH`, `DINNER`

Example:

```json
{
  "dayOfWeek": "MONDAY",
  "meals": ["BREAKFAST", "LUNCH", "DINNER"]
}
```

### `PATCH /deadlines/:mealType`

Auth: `ADMIN`, `MANAGER`

Validated `params`:

```ts
type UpdateDeadlineParams = {
  mealType: MealType;
};
```

Validated `body`:

```ts
type UpdateDeadlineBody = {
  time: string;
  offsetDays: number;
};
```

Rules:

- `mealType` must be `BREAKFAST`, `LUNCH`, or `DINNER`
- `time` must match `HH:MM`
- `offsetDays` must be an integer

### `POST /deadlines`

Auth: `ADMIN`, `MANAGER`

Validated `body`:

```ts
type DeadlineBody = {
  type: MealType;
  time: string;
  offsetDays: number;
};
```

Rules:

- `type` must be `BREAKFAST`, `LUNCH`, or `DINNER`
- `time` must match `HH:MM`
- `offsetDays` must be an integer

Note:

- the schema transforms `type` to uppercase, but the enum already expects uppercase values, so the frontend should still send uppercase enum strings

### `GET /schedules`

Auth: public

Validated `query`:

```ts
type ScheduleQuery = {
  date?: string;
  month?: string;
};
```

Rules:

- `date`, if sent, must be `YYYY-MM-DD`
- `month`, if sent, must be `YYYY-MM`
- backend allows sending neither
- backend also allows sending both, but frontend should normally send one filter or none

Examples:

```txt
/schedules
/schedules?date=2026-04-05
/schedules?month=2026-04
```

### `POST /schedules/generate`

Auth: `ADMIN`, `MANAGER`

Validated `body`:

```ts
type GenerateSchedulesBody = {
  month: string;
};
```

Rules:

- `month` must be `YYYY-MM`

### `POST /schedules`

Auth: `ADMIN`, `MANAGER`

Validated `body`:

```ts
type CreateScheduleBody = {
  date: string;
  meals: {
    type: MealType;
    isAvailable?: boolean;
    weight?: number;
    menu?: string;
  }[];
};
```

Rules:

- `date` must be `YYYY-MM-DD`
- `meals` must be an array
- each meal `type` must be a valid `MealType`
- `weight`, if sent, must be a positive number

Note:

- the schema does not require at least one meal, so an empty array is currently valid

### `POST /schedules/:scheduleId/meals`

Auth: `ADMIN`, `MANAGER`

Validated `body`:

```ts
type AddMealBody = {
  type: MealType;
  isAvailable?: boolean;
  weight?: number;
  menu?: string;
};
```

Rules:

- `type` is required
- `weight`, if sent, must be a positive number

### `PATCH /schedules/:scheduleId/meals/:mealType`

Auth: `ADMIN`, `MANAGER`

Validated `params`:

```ts
type UpdateMealParams = {
  mealType: MealType;
};
```

Validated `body`:

```ts
type UpdateMealBody = {
  isAvailable?: boolean;
  weight?: number;
  menu?: string;
};
```

Rules:

- `mealType` must be a valid `MealType`
- `weight`, if sent, must be a positive number
- backend currently allows an empty object

### `POST /registrations`

Auth: authenticated

Validated `body`:

```ts
type UpsertRegistrationBody = {
  scheduledMealId: string;
  userId?: string;
  count: number;
};
```

Rules:

- `scheduledMealId` is required and must be non-empty
- `userId`, if sent, must be non-empty
- `count` must be an integer and at least `1`

Frontend behavior note:

- `MEMBER` should omit `userId`
- `ADMIN` and `MANAGER` may send `userId` to register for another user

### `PATCH /registrations/:id`

Auth: authenticated

Validated `body`:

```ts
type UpdateRegistrationBody = {
  count: number;
};
```

Rules:

- `count` must be an integer and at least `1`

### `GET /deposits/my-total`

Auth: authenticated

Validated `query`:

```ts
type MonthlyDepositTotalQuery = {
  month: string;
};
```

Rules:

- `month` must be `YYYY-MM`

### `POST /deposits`

Auth: `ADMIN`, `MANAGER`

Validated `body`:

```ts
type CreateDepositBody = {
  userId: string;
  amount: number;
  month: string;
  note?: string;
  date?: string;
};
```

Rules:

- `userId` is required and must be non-empty
- `amount` must be greater than `0`
- `month` must be `YYYY-MM`
- `date`, if sent, is only checked as a string by Zod, so frontend should still send `YYYY-MM-DD`

### `PATCH /deposits/:id`

Auth: `ADMIN`, `MANAGER`

Validated `body`:

```ts
type UpdateDepositBody = {
  userId?: string;
  amount?: number;
  month?: string;
  note?: string;
  date?: string;
};
```

Rules:

- if present, `userId` must be non-empty
- if present, `amount` must be greater than `0`
- if present, `month` must be `YYYY-MM`
- at least one field must be sent

### `POST /expenses`

Auth: `ADMIN`, `MANAGER`

Validated `body`:

```ts
type CreateExpenseBody = {
  date?: string;
  amount: number;
  category: ExpenseCategory;
  personName: string;
  description?: string;
  month: string;
};
```

Rules:

- `amount` must be greater than `0`
- `category` must be one of `GAS`, `TRANSPORT`, `BAZAR`, `OTHER`
- `personName` is required and must be non-empty
- `month` must be `YYYY-MM`
- `date`, if sent, is only checked as a string by Zod, so frontend should still send `YYYY-MM-DD`

### `PATCH /expenses/:id`

Auth: `ADMIN`, `MANAGER`

Validated `body`:

```ts
type UpdateExpenseBody = {
  date?: string;
  amount?: number;
  category?: ExpenseCategory;
  personName?: string;
  description?: string;
  month?: string;
};
```

Rules:

- if present, `amount` must be greater than `0`
- if present, `category` must be a valid `ExpenseCategory`
- if present, `personName` must be non-empty
- if present, `month` must be `YYYY-MM`
- at least one field must be sent

### `POST /finalize`

Auth: `ADMIN`, `MANAGER`

Same validation is also used by `POST /finalization`.

Validated `body`:

```ts
type FinalizeMonthBody = {
  month: string;
};
```

Rules:

- `month` must be `YYYY-MM`

## Runtime Business Rules Not Enforced Only By Zod

These are important for frontend UX even though they are not part of the validation schema itself.

- finalized months are locked for deposit, expense, schedule-related, and registration-related mutations
- `MEMBER` users can only create, update, or delete their own registrations
- member registrations can fail after the configured deadline for that meal type
- unavailable meals cannot be registered
- month finalization requires at least one expense
- month finalization requires at least one meal registration

## Common Response Types

These are practical frontend types based on the current backend models and responses.

```ts
export type User = {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  mobile?: string | null;
  role: UserRole;
  profileImage?: string | null;
  balance: string | number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ScheduledMeal = {
  id: string;
  scheduleId: string;
  type: MealType;
  isAvailable: boolean;
  weight: string | number;
  menu?: string | null;
  updatedAt: string;
};

export type MealSchedule = {
  id: string;
  date: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  meals: ScheduledMeal[];
};

export type MealRegistration = {
  id: string;
  scheduledMealId: string;
  userId: string;
  count: number;
  registeredById: string;
  createdAt: string;
  updatedAt: string;
};

export type Deposit = {
  id: string;
  userId: string;
  amount: string | number;
  recordedById: string;
  month: string;
  note?: string | null;
  date: string;
  createdAt: string;
};

export type Expense = {
  id: string;
  date: string;
  amount: string | number;
  category: ExpenseCategory;
  personName: string;
  description?: string | null;
  loggedById: string;
  month: string;
  createdAt: string;
};

export type ApiSuccess<T> = {
  success: true;
  message: string;
  meta: unknown;
  data: T;
};

export type ApiErrorSource = {
  path: string;
  message: string;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errorSources?: ApiErrorSource[];
  stack?: string | null;
};
```

## Frontend Implementation Notes

- prefer one shared API client that automatically attaches Firebase ID tokens
- keep enum values centralized in frontend constants or types
- normalize all month input values as `YYYY-MM`
- normalize all date input values as `YYYY-MM-DD`
- send numeric fields as numbers, especially `amount`, `weight`, `count`, and `offsetDays`
- avoid sending empty objects to update routes unless the route explicitly supports it
