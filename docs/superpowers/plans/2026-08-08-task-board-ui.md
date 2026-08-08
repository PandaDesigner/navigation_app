# Task Board UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver `/task` as a personal-first Kanban board with family switching, mock-adapter data, and the persistent bottom navigation menu.

**Architecture:** Route components consume a board view-model utility, never mock implementation details. The utility obtains `TaskRepository` through `RepositoryAdapter`, filters the active scope and computes presentation-only summary/column data. React Native components render that data and remain focused on layout and accessibility.

**Tech Stack:** Expo SDK 54, Expo Router 6, React Native 0.81, TypeScript strict, Jest 29, jest-expo, React Native Testing Library, NativeWind.

## Global Constraints

- Use `RepositoryAdapter`; UI must not import mock repository implementations.
- Default to the Personal scope; Family is an explicit in-screen switch.
- Keep cancellation supported in data but hide cancelled tasks from the initial board.
- Keep the existing `NavMenu` visible on the Task screen.
- Do not add Supabase, maps, notification scheduling, task creation, or drag-and-drop.
- Use Jest/jest-expo as the only test runner; remove Vitest configuration and dependencies.

---

## File Structure

- `jest.config.js` — Expo-compatible Jest configuration.
- `tests/models/` — converted model/repository tests.
- `features/tasks/task-board-view-model.ts` — scope filtering, summary and column grouping.
- `features/tasks/task-board-types.ts` — UI-only const-derived scope and column types.
- `components/task-scope-switcher.tsx` — Personal/Family selector.
- `components/task-summary.tsx` — counts for pending, blocked and overdue.
- `components/task-card.tsx` — accessible task metadata card.
- `components/task-kanban-column.tsx` — a single board column.
- `components/task-board.tsx` — adapter-driven board orchestration.
- `app/task/_layout.tsx` and `app/task/index.tsx` — `/task` route and screen composition.
- `constant/item-nav.ts`, `app/_layout.tsx`, `models/menu-models.ts` — route and Expense Management navigation updates.

### Task 1: Migrate unit tests from Vitest to Expo Jest

**Files:**
- Create: `jest.config.js`
- Modify: `package.json`, `bun.lock`, `tests/models/*.test.ts`
- Delete: `vitest.config.ts`

**Interfaces:**
- Produces: `npm test -- --runInBand` executes all existing model tests through `jest-expo`.

- [ ] **Step 1: Verify the current runner fails to execute Jest tests**

Run:

```bash
npm test -- --runInBand
```

Expected: FAIL because `package.json` still points to Vitest.

- [ ] **Step 2: Configure Jest and migrate test imports**

Create `jest.config.js`:

```js
module.exports = {
  preset: "jest-expo",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["<rootDir>/tests/**/*-test.ts"],
};
```

Replace each `vitest` import with Jest globals; for example:

```ts
import { TASK_STATUS } from "@/models/task-models";

describe("task statuses", () => {
  it("contains the Kanban states", () => {
    expect(Object.values(TASK_STATUS)).toContain("backlog");
  });
});
```

Set the package script to `"test": "jest"`, remove `vitest`, delete `vitest.config.ts`, and install `@testing-library/react-native` using `bunx expo install @testing-library/react-native --dev`.

- [ ] **Step 3: Verify and commit**

Run:

```bash
npm test -- --runInBand
npx tsc --noEmit
npm run lint
git add package.json bun.lock jest.config.js tests/models vitest.config.ts
git commit -m "test: migrate to expo jest"
```

Expected: all model tests pass under Jest.

### Task 2: Build the Task board view-model

**Files:**
- Create: `features/tasks/task-board-types.ts`, `features/tasks/task-board-view-model.ts`, `tests/features/task-board-view-model-test.ts`

**Interfaces:**
- Consumes: `Task`, `TaskStatus`, `RepositoryAdapter`.
- Produces: `TASK_BOARD_SCOPE`, `TaskBoardScope`, `TASK_BOARD_COLUMNS`, `getTaskBoardData(adapter, ownerId, scope, now)`.

- [ ] **Step 1: Write failing scope and summary tests**

```ts
it("keeps private records in the personal board and family-visible records in the family board", async () => {
  const adapter = createMockRepositoryAdapter();

  const personal = await getTaskBoardData(adapter, "user-owner", "personal", "2026-08-08T12:00:00.000Z");
  const family = await getTaskBoardData(adapter, "user-owner", "family", "2026-08-08T12:00:00.000Z");

  expect(personal.tasks.map((task) => task.id)).toContain("task-private-productive");
  expect(family.tasks.map((task) => task.id)).toContain("task-phone-service");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- --runInBand tests/features/task-board-view-model-test.ts
```

Expected: FAIL because the view-model does not exist.

- [ ] **Step 3: Implement filtering and derived presentation data**

`getTaskBoardData` must query `adapter.taskRepository.listByOwner(ownerId)`, exclude cancelled records, include private records only in Personal, include `familyId !== null` records in Family, sort every column by `sortOrder`, and derive counts:

```ts
interface TaskBoardSummary {
  pendingCount: number;
  blockedCount: number;
  overdueCount: number;
}
```

Overdue means `dueAt` is before `now` and status is neither `completed` nor `cancelled`.

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test -- --runInBand tests/features/task-board-view-model-test.ts
npm test -- --runInBand
npx tsc --noEmit
npm run lint
git add features/tasks tests/features
git commit -m "feat: add task board view model"
```

### Task 3: Render and route the Task board

**Files:**
- Create: `components/task-scope-switcher.tsx`, `components/task-summary.tsx`, `components/task-card.tsx`, `components/task-kanban-column.tsx`, `components/task-board.tsx`, `app/task/_layout.tsx`, `app/task/index.tsx`, `tests/components/task-board-test.tsx`
- Modify: `constant/item-nav.ts`, `app/_layout.tsx`, `models/menu-models.ts`
- Delete: `app/(task)/task.tsx`

**Interfaces:**
- Consumes: `getTaskBoardData`, `TaskBoardScope`, `NavMenu`.
- Produces: `/task` route with an accessible Personal/Family selector and task cards.

- [ ] **Step 1: Write a failing Task board test**

```tsx
it("renders the personal board and switches to family tasks", async () => {
  const screen = render(<TaskBoard ownerId="user-owner" />);

  expect(await screen.findByText("Review monthly goals")).toBeTruthy();
  fireEvent.press(screen.getByRole("button", { name: "Family tasks" }));
  expect(await screen.findByText("Pay family phone service")).toBeTruthy();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- --runInBand tests/components/task-board-test.tsx
```

Expected: FAIL because `TaskBoard` does not exist.

- [ ] **Step 3: Implement focused components and route migration**

Use `ScrollView` horizontally for columns and vertically within each column. `TaskCard` includes `accessibilityLabel` containing the title and task type, and displays `Paid` when `expenseId` exists. `TaskScopeSwitcher` exposes buttons named `Personal tasks` and `Family tasks`.

Configure `app/task/_layout.tsx` with `Stack`, render `TaskBoard` and `NavMenu` in `app/task/index.tsx`, change Task navigation `href` to `/task`, and change Wallet label/id/icon semantics to Expense Management. Add an explicit root stack screen for `task` so its header title resolves correctly.

- [ ] **Step 4: Verify and commit**

Run:

```bash
npm test -- --runInBand tests/components/task-board-test.tsx
npm test -- --runInBand
npm run lint
git add app components constant models tests
git commit -m "feat: add task kanban board"
```

## Self-Review

- **Spec coverage:** Tasks 1–3 cover Jest migration, adapter-only scope filtering, task summaries/columns/cards, `/task` migration, navigation update, and the persistent menu. Supabase and out-of-scope interactions are excluded.
- **Placeholder scan:** The plan contains concrete files, function names, assertions and commands; it has no unresolved markers.
- **Type consistency:** `getTaskBoardData` produces the scope/summary/columns consumed by `TaskBoard`; `TaskBoard` is the screen component rendered by `app/task/index.tsx`.
