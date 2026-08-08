# Task and Expense Domain Design

## Goal
Build a multi-user task-management application where tasks can optionally affect personal or family expenses. Implement shared TypeScript models and mock repositories before any task UI or Supabase integration.

## Scope
- Route Task as `app/task/_layout.tsx` and `app/task/index.tsx`, exposed at `/task`.
- Rename Wallet navigation to Expense Management.
- Define models and mocks only; no task UI and no Supabase client yet.
- Keep the persistence design compatible with Supabase Auth, Postgres, and row-level security (RLS).

## Domain model

### Identity and family
- `UserProfile` represents the application profile associated one-to-one with `auth.users`.
- `Family` is a household workspace.
- `FamilyMembership` links a user to a family with `owner`, `admin`, or `member` role.

### Visibility
Both tasks and expenses are private by default. A record has one visibility scope:
- `private`: only its owner can access it.
- `family`: every member of its family can access it.
- `members`: only explicitly listed family members can access it.

`TaskShare` and `ExpenseShare` store selected member access. The model separates ownership from visibility, allowing a parent and child to share a phone-bill obligation without exposing all private records.

### Tasks
A `Task` belongs to an owner and stores title, description, type, Kanban status, sort order, due date, reminders, visibility, and optional relations.

Task types:
- `payment_service` (telephone, electricity, water, subscriptions)
- `payment_goods`
- `productive`
- `activity`
- `trip`
- `event`
- `reminder`

Kanban statuses:
- `backlog`
- `planned`
- `pending`
- `in_progress`
- `blocked` (requires a blocking reason)
- `completed`
- `cancelled` (requires a cancellation reason)

UI tags are derived rather than stored as statuses: `Paid`, `Scheduled`, `Overdue`, and `Upcoming`.

### Expenses and task links
An `Expense` stores owner, amount, currency, category, service subtype, due/payment date, payment status, visibility, optional family, and selected sharers.

A payment task may link to one expense using `task.expenseId`. Completing the task marks the linked expense as `paid`. This applies to personal or family expenses.

### Locations and reminders
- A `TaskLocation` stores destination name, latitude and longitude for `trip` tasks.
- Route tracing obtains the origin from the device only when the user requests it; the origin is not stored by default.
- A `TaskReminder` has a scheduled time and notification metadata. It supports local device notifications initially and is compatible with future push notifications.

### Recurrence
`RecurringTask` is a schedule template; concrete `Task` records link to it through `recurringTaskId`.

Supported frequencies: `weekly`, `biweekly`, `monthly`, `quarterly`, `annually`.

Generate concrete instances lazily within a short look-ahead window (initially four weeks), and generate the next one on completion or expiry. Do not pre-create every future occurrence. Each instance preserves its own Kanban state and may link to its own expense.

## Persistence mapping
Future Supabase tables:
- `profiles`
- `families`
- `family_memberships`
- `tasks`
- `task_shares`
- `task_reminders`
- `task_locations`
- `recurring_tasks`
- `expenses`
- `expense_shares`

Every user-owned table includes `owner_id` referencing `auth.users`. RLS must permit the owner, family-wide visibility, or explicit share access as applicable.

## Development structure
- `models/`: shared domain types and const-derived types.
- `mocks/`: realistic fixture data and in-memory repositories implementing repository interfaces.
- `repositories/`: interfaces consumed by future UI; mock and Supabase implementations share the same contracts.

## Out of scope
- Task UI, Kanban interaction, map rendering, device-notification scheduling, and Supabase integration.
- Nequi, Daviplata, and bank integrations. These are a V2 research item.

## Verification
- TypeScript strict checking validates all model relationships.
- `expo lint` passes.
- Mock fixtures cover private, family-wide, selected-member, payment, trip, event, reminder, blocked, cancelled, and recurring scenarios.
