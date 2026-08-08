# Task Board UI Design

## Goal
Replace the Task placeholder with a personal-first Kanban board backed by the existing repository adapter and mock data.

## Scope
- Move the route from `app/(task)/task.tsx` to `app/task/_layout.tsx` and `app/task/index.tsx`, exposed as `/task`.
- Update navigation to use `/task` and rename Wallet to Expense Management.
- Render the existing bottom navigation menu inside the Task screen.
- Show a Personal/Family selector, summary metrics, Kanban columns, and task cards.
- Use only `createMockRepositoryAdapter`; do not integrate Supabase, maps, notifications, drag-and-drop, or task creation forms in this slice.

## Screen behavior
- Personal is selected initially.
- The Family selector shows family-visible mock tasks.
- Summary displays pending, blocked, and overdue task counts for the active scope.
- Kanban columns render Backlog, Planned, In progress, Blocked, and Completed. Cancelled tasks are excluded from the initial board but remain supported in the domain.
- A task card shows title, type, due date, status context, and an expense tag when `expenseId` is present.
- The bottom menu remains visible and uses the existing `NavMenu` component.

## Components
- `components/task-board.tsx` owns adapter loading and active scope state.
- `components/task-scope-switcher.tsx` renders the Personal/Family control.
- `components/task-summary.tsx` calculates and displays the three summary counts.
- `components/task-kanban-column.tsx` renders one status column.
- `components/task-card.tsx` renders task metadata with accessibility labels.
- `app/task/index.tsx` composes the screen and `NavMenu`.

## Data flow
`TaskBoard` creates the mock repository adapter, reads the current fixture user, queries the task repository, filters by visibility and scope, then passes immutable task arrays to presentation components. No UI component imports mock repository implementation details.

## Verification
- Jest unit tests cover summary counts and Personal/Family filtering.
- Expo Router route resolves at `/task`.
- `npm test`, `npx tsc --noEmit`, and `npm run lint` pass after excluding the ignored local starter example if necessary.
