# Task and Expense Models Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide strictly typed, mock-backed shared domain contracts for multi-user tasks, family expense sharing, reminders, locations, and lazy recurrence before UI or Supabase work.

**Architecture:** Keep domain definitions in focused model files, exposing runtime `as const` values with types derived from them. Repository interfaces isolate consumers from data storage; in-memory mock repositories implement those interfaces and provide deterministic fixtures, so a future Supabase adapter can replace them without changing UI or use cases.

**Tech Stack:** Expo SDK 54, TypeScript 5.9 strict mode, Vitest, Expo lint.

## Global Constraints

- Use `as const` runtime objects/arrays and derive all value-union types from them; do not write direct string unions.
- Do not use `any`; use explicit interfaces and `unknown` only at external boundaries.
- Keep UI, Supabase client setup, map rendering, notification scheduling, and banking integrations out of this slice.
- Payment-task completion must mark a linked expense `paid`.
- Private, family-wide, and selected-member visibility must remain distinct.
- Generate recurring task occurrences lazily; no bulk creation of every future occurrence.

---

## File Structure

- `models/user-models.ts` — profile, family, membership roles, visibility, and share-target contracts.
- `models/task-models.ts` — task types/statuses, task payload, reminder, destination and recurrence-template contracts.
- `models/expense-models.ts` — expense types/statuses and task-to-expense relation contracts.
- `repositories/task-repository.ts` — persistence-agnostic task queries and mutations.
- `repositories/expense-repository.ts` — persistence-agnostic expense queries and mutations.
- `mocks/task-mock-repository.ts` — in-memory task implementation and representative task fixtures.
- `mocks/expense-mock-repository.ts` — in-memory expense implementation and representative expense fixtures.
- `tests/models/*.test.ts` — model and repository behavior tests.
- `vitest.config.ts` and `package.json` — Node-based unit-test configuration and `test` script.

### Task 1: Establish the model test harness

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/models/test-helpers.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm test -- --run` executes `tests/models/**/*.test.ts` in Node.

- [ ] **Step 1: Add a failing smoke test**

Create `tests/models/test-helpers.ts` and `tests/models/test-helpers.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { createTestId } from "./test-helpers";

describe("createTestId", () => {
  it("prefixes deterministic identifiers", () => {
    expect(createTestId("task", 1)).toBe("task-1");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run tests/models/test-helpers.test.ts`

Expected: FAIL because the `test` script, Vitest configuration, and helper do not exist.

- [ ] **Step 3: Add the minimal test setup and helper**

Install `vitest` as a development dependency. Add this script to `package.json`:

```json
"test": "vitest"
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

Create `tests/models/test-helpers.ts`:

```ts
export function createTestId(prefix: string, index: number): string {
  return `${prefix}-${index}`;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --run tests/models/test-helpers.test.ts`

Expected: PASS with one test.

- [ ] **Step 5: Commit**

```bash
git add package.json bun.lock vitest.config.ts tests/models/test-helpers.ts tests/models/test-helpers.test.ts
git commit -m "test: add model test harness"
```

### Task 2: Define identity, family, and visibility contracts

**Files:**
- Create: `models/user-models.ts`
- Test: `tests/models/user-models.test.ts`

**Interfaces:**
- Produces: `FAMILY_MEMBER_ROLE`, `FamilyMemberRole`, `VISIBILITY_SCOPE`, `VisibilityScope`, `UserProfile`, `Family`, `FamilyMembership`, and `ShareTarget`.
- Consumes: none.

- [ ] **Step 1: Write failing contract tests**

```ts
import { describe, expect, it } from "vitest";

import { FAMILY_MEMBER_ROLE, VISIBILITY_SCOPE } from "@/models/user-models";

describe("user domain constants", () => {
  it("defines the supported family roles", () => {
    expect(FAMILY_MEMBER_ROLE).toEqual({ OWNER: "owner", ADMIN: "admin", MEMBER: "member" });
  });

  it("keeps the three visibility scopes distinct", () => {
    expect(Object.values(VISIBILITY_SCOPE)).toEqual(["private", "family", "members"]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run tests/models/user-models.test.ts`

Expected: FAIL because `models/user-models.ts` does not exist.

- [ ] **Step 3: Implement the contracts**

Create const-derived role and visibility values plus flat interfaces. `ShareTarget` must include `ownerId`, `familyId | null`, `visibility`, and `sharedWithUserIds: readonly string[]`; validate selected-member sharing in repositories rather than with a boolean.

```ts
export const VISIBILITY_SCOPE = {
  PRIVATE: "private",
  FAMILY: "family",
  MEMBERS: "members",
} as const;

export type VisibilityScope = (typeof VISIBILITY_SCOPE)[keyof typeof VISIBILITY_SCOPE];
```

- [ ] **Step 4: Run verification**

Run: `npm test -- --run tests/models/user-models.test.ts && npx tsc --noEmit && npm run lint`

Expected: all commands exit successfully.

- [ ] **Step 5: Commit**

```bash
git add models/user-models.ts tests/models/user-models.test.ts
git commit -m "feat: add family visibility models"
```

### Task 3: Define task, reminder, location, and recurrence contracts

**Files:**
- Create: `models/task-models.ts`
- Test: `tests/models/task-models.test.ts`

**Interfaces:**
- Consumes: `ShareTarget` from `models/user-models.ts`.
- Produces: `TASK_TYPE`, `TASK_STATUS`, `RECURRENCE_FREQUENCY`, their derived types, and `Task`, `TaskReminder`, `TaskLocation`, and `RecurringTask` interfaces.

- [ ] **Step 1: Write failing model tests**

```ts
import { describe, expect, it } from "vitest";

import { RECURRENCE_FREQUENCY, TASK_STATUS, TASK_TYPE } from "@/models/task-models";

describe("task domain constants", () => {
  it("includes payment, travel, event, and reminder types", () => {
    expect(Object.values(TASK_TYPE)).toContain("payment_service");
    expect(Object.values(TASK_TYPE)).toContain("trip");
    expect(Object.values(TASK_TYPE)).toContain("event");
    expect(Object.values(TASK_TYPE)).toContain("reminder");
  });

  it("includes Kanban backlog and resolution states", () => {
    expect(Object.values(TASK_STATUS)).toEqual([
      "backlog", "planned", "pending", "in_progress", "blocked", "completed", "cancelled",
    ]);
  });

  it("includes every supported recurrence frequency", () => {
    expect(Object.values(RECURRENCE_FREQUENCY)).toEqual([
      "weekly", "biweekly", "monthly", "quarterly", "annually",
    ]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run tests/models/task-models.test.ts`

Expected: FAIL because `models/task-models.ts` does not exist.

- [ ] **Step 3: Implement the contracts**

Define the three const objects and flat interfaces. `Task` must include `id`, `ownerId`, `familyId`, `visibility`, `sharedWithUserIds`, `type`, `status`, `sortOrder`, `title`, `description`, `dueAt`, `blockedReason`, `cancelledReason`, `expenseId`, `location`, `reminders`, `recurringTaskId`, `createdAt`, and `updatedAt`.

`RecurringTask` must include one schedule template, `nextOccurrenceAt`, `defaultExpenseAmountMinor`, `defaultExpenseCurrency`, and `defaultExpenseCategory`; it must not store an array of future task instances.

- [ ] **Step 4: Run verification**

Run: `npm test -- --run tests/models/task-models.test.ts && npx tsc --noEmit && npm run lint`

Expected: all commands exit successfully.

- [ ] **Step 5: Commit**

```bash
git add models/task-models.ts tests/models/task-models.test.ts
git commit -m "feat: add task domain models"
```

### Task 4: Define expense contracts and persistence interfaces

**Files:**
- Create: `models/expense-models.ts`
- Create: `repositories/task-repository.ts`
- Create: `repositories/expense-repository.ts`
- Test: `tests/models/expense-models.test.ts`

**Interfaces:**
- Consumes: `ShareTarget`, `Task`, `TaskStatus`.
- Produces: `EXPENSE_STATUS`, `ExpenseStatus`, `Expense`, `CreateTaskInput`, `UpdateTaskStatusInput`, `CreateExpenseInput`, `TaskRepository`, and `ExpenseRepository`.

- [ ] **Step 1: Write failing contract tests**

```ts
import { describe, expect, it } from "vitest";

import { EXPENSE_STATUS } from "@/models/expense-models";

describe("expense status", () => {
  it("tracks payment independently from task workflow", () => {
    expect(EXPENSE_STATUS).toEqual({ PENDING: "pending", PAID: "paid", CANCELLED: "cancelled" });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run tests/models/expense-models.test.ts`

Expected: FAIL because the expense models do not exist.

- [ ] **Step 3: Implement the contracts**

`Expense` must include owner/family/visibility sharing fields, amount in minor units, ISO currency, category, optional service subtype, payment status, due date, paid date, and timestamps.

Define repository methods with these exact signatures:

```ts
export interface TaskRepository {
  listByOwner(ownerId: string): Promise<readonly Task[]>;
  create(input: CreateTaskInput): Promise<Task>;
  updateStatus(input: UpdateTaskStatusInput): Promise<Task>;
}

export interface ExpenseRepository {
  listByOwner(ownerId: string): Promise<readonly Expense[]>;
  create(input: CreateExpenseInput): Promise<Expense>;
  markPaid(expenseId: string, paidAt: string): Promise<Expense>;
}
```

- [ ] **Step 4: Run verification**

Run: `npm test -- --run tests/models/expense-models.test.ts && npx tsc --noEmit && npm run lint`

Expected: all commands exit successfully.

- [ ] **Step 5: Commit**

```bash
git add models/expense-models.ts repositories/task-repository.ts repositories/expense-repository.ts tests/models/expense-models.test.ts
git commit -m "feat: add expense repository contracts"
```

### Task 5: Implement in-memory mocks and payment completion behavior

**Files:**
- Create: `mocks/task-mock-repository.ts`
- Create: `mocks/expense-mock-repository.ts`
- Create: `mocks/domain-fixtures.ts`
- Test: `tests/models/mock-repositories.test.ts`

**Interfaces:**
- Consumes: both repository interfaces and all domain models.
- Produces: `createMockTaskRepository`, `createMockExpenseRepository`, and fixtures for private, family-wide, selected-member, travel, event, blocked, cancelled, and recurring records.

- [ ] **Step 1: Write failing behavioral tests**

```ts
import { describe, expect, it } from "vitest";

import { createMockExpenseRepository } from "@/mocks/expense-mock-repository";
import { createMockTaskRepository } from "@/mocks/task-mock-repository";
import { TASK_STATUS } from "@/models/task-models";

describe("mock payment completion", () => {
  it("marks a linked expense paid when a payment task completes", async () => {
    const expenses = createMockExpenseRepository();
    const tasks = createMockTaskRepository(expenses);
    const task = await tasks.createPaymentTaskWithExpense();

    await tasks.updateStatus({ taskId: task.id, status: TASK_STATUS.COMPLETED });

    await expect(expenses.getById(task.expenseId!)).resolves.toMatchObject({ status: "paid" });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --run tests/models/mock-repositories.test.ts`

Expected: FAIL because mock repositories and the payment-completion behavior do not exist.

- [ ] **Step 3: Implement deterministic fixtures and repositories**

Create in-memory arrays cloned per factory call. `TaskMockRepository.updateStatus` must reject `blocked` without `blockedReason`, reject `cancelled` without `cancelledReason`, and call `ExpenseRepository.markPaid` when completing a linked payment task. Add a `createPaymentTaskWithExpense` helper solely on the mock repository for fixture setup; keep it out of `TaskRepository`.

Create fixtures with at least:
- one private productive task in backlog;
- one family-wide phone-service payment task linked to a pending expense;
- one selected-member allowance expense;
- one blocked trip task with destination coordinates;
- one planned birthday event with a reminder;
- one annual subscription recurrence template.

- [ ] **Step 4: Run full verification**

Run: `npm test -- --run && npx tsc --noEmit && npm run lint`

Expected: all tests, strict type-checking, and lint pass.

- [ ] **Step 5: Commit**

```bash
git add mocks/task-mock-repository.ts mocks/expense-mock-repository.ts mocks/domain-fixtures.ts tests/models/mock-repositories.test.ts
git commit -m "feat: add task and expense mocks"
```

## Self-Review

- **Spec coverage:** Tasks 2–5 cover identity/families, granular sharing, Kanban statuses, reminders, locations, lazy recurrence, expenses, task-expense completion, and mocks. Task route/UI, map rendering, notifications, Supabase client, and V2 financial integrations remain explicitly out of scope.
- **Placeholder scan:** No unresolved markers or generic implementation instructions remain; every task has concrete paths, commands, signatures, and test content.
- **Type consistency:** `TaskRepository`, `ExpenseRepository`, `Task`, `Expense`, `TaskStatus`, and `UpdateTaskStatusInput` are defined before mock usage. `createPaymentTaskWithExpense` is intentionally mock-specific.
