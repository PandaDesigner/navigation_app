# Task Responsive Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver responsive primary navigation and clearly separated Drawer and Task-creation actions in the Task view.

**Architecture:** A pure utility derives visible navigation destinations from the shared configuration. `NavMenu` consumes that utility and owns only destination routing plus the Drawer button. `TaskCreateMenu` is local to Task and routes its three fixed actions to the existing create route with a typed creation kind.

**Tech Stack:** Expo SDK 54, Expo Router 6, React Native 0.81, TypeScript strict, Jest 29, jest-expo, React Native Testing Library, NativeWind.

## Global Constraints

- Use the installed Expo SDK `~54.0.35` and Expo Router `~6.0.24`.
- On web, show icon plus label for every primary navigation destination.
- On mobile, show at most four primary destinations; only the active destination shows its label.
- Menu and `+` controls do not count against the four-destination mobile limit.
- Overflow destinations must be Drawer-only on mobile.
- Menu opens the parent Drawer; Task creation actions never open the Drawer.
- The floating creation menu contains exactly New task, Reminder, and Recurring task.
- Use Jest/jest-expo and keep test files under `tests/`.

---

## File Structure

- `features/navigation/navigation-menu.ts` — derives web, mobile, and overflow destinations from navigation configuration.
- `features/navigation/navigation-menu-types.ts` — const-derived navigation presentation types and mobile limit.
- `components/tab-buttons.tsx` — renders an icon and an explicitly controlled label visibility state.
- `components/nav-menu.tsx` — renders responsive primary destinations and the dedicated Drawer Menu control.
- `components/task-create-menu.tsx` — Task-local floating creation menu and create-route navigation.
- `app/(drawer)/(task)/task.tsx` — composes the Task placeholder, `NavMenu`, and `TaskCreateMenu`.
- `app/(drawer)/(task)/create.tsx` — reads the creation kind and renders a safe creation entry state.
- `tests/features/navigation-menu.test.ts` — tests destination derivation.
- `tests/components/nav-menu-responsive.test.tsx` — tests responsive labels and the Drawer control.
- `tests/components/task-create-menu.test.tsx` — tests floating actions and their navigation URLs.
- `tests/routes/task-create-route.test.tsx` — tests create-kind fallback behavior.

### Task 1: Derive responsive navigation destinations

**Files:**
- Create: `features/navigation/navigation-menu-types.ts`, `features/navigation/navigation-menu.ts`, `tests/features/navigation-menu.test.ts`

**Interfaces:**
- Consumes: `NavigationItems`.
- Produces: `MOBILE_PRIMARY_NAVIGATION_LIMIT`, `NavigationPresentation`, and `getNavigationPresentation(items, platform)`.

- [ ] **Step 1: Write the failing mobile-limit and overflow tests**

```ts
import { getNavigationPresentation } from "@/features/navigation/navigation-menu";

it("keeps only the first four primary destinations on mobile", () => {
  const result = getNavigationPresentation(itemsWithFivePrimaryDestinations, "mobile");

  expect(result.primary.map((item) => item.id)).toEqual(["wallet", "home", "task", "reports"]);
  expect(result.drawerOnly.map((item) => item.id)).toEqual(["settings"]);
});

it("keeps every primary destination visible on web", () => {
  const result = getNavigationPresentation(itemsWithFivePrimaryDestinations, "web");

  expect(result.primary).toHaveLength(5);
  expect(result.drawerOnly).toEqual([]);
});
```

Use five fixture items that all set `showInNavMenu: true` and `showInDrawer: true`; assert that an item excluded from the primary menu never appears in `primary`.

- [ ] **Step 2: Run the red test**

Run:

```bash
npm test -- --runInBand tests/features/navigation-menu.test.ts
```

Expected: FAIL because the utility does not exist.

- [ ] **Step 3: Implement the pure utility**

Create the types:

```ts
export const MOBILE_PRIMARY_NAVIGATION_LIMIT = 4 as const;
export type NavigationPlatform = "web" | "mobile";
export interface NavigationPresentation {
  primary: readonly NavigationItem[];
  drawerOnly: readonly NavigationItem[];
}
```

Implement `getNavigationPresentation` by filtering `showInNavMenu`, returning every filtered item for `web`, and slicing the first four for `mobile`. `drawerOnly` is the remaining filtered items that also have `showInDrawer: true`.

- [ ] **Step 4: Verify and commit**

```bash
npm test -- --runInBand tests/features/navigation-menu.test.ts
npx tsc --noEmit
git add features/navigation tests/features/navigation-menu.test.ts
git commit -m "feat: derive responsive navigation items"
```

### Task 2: Render responsive navigation and a dedicated Drawer button

**Files:**
- Modify: `components/tab-buttons.tsx`, `components/nav-menu.tsx`
- Create: `tests/components/nav-menu-responsive.test.tsx`

**Interfaces:**
- Consumes: `getNavigationPresentation`, `NavigationPlatform`, `DrawerActions.openDrawer()`.
- Produces: `TabButton` with `labelVisibility: "always" | "active"`, plus a Menu button named `Open navigation menu`.

- [ ] **Step 1: Write failing responsive rendering tests**

```tsx
it("shows every web destination with its label", async () => {
  const view = await render(<NavMenu platform="web" />);
  expect(view.getByText("Wallet")).toBeTruthy();
  expect(view.getByText("Home")).toBeTruthy();
  expect(view.getByText("Task")).toBeTruthy();
});

it("shows only the active mobile destination label", async () => {
  const view = await render(<NavMenu platform="mobile" />);
  expect(view.getByText("Task")).toBeTruthy();
  expect(view.queryByText("Wallet")).toBeNull();
  expect(view.queryByText("Home")).toBeNull();
});

it("opens the parent Drawer from the Menu button", async () => {
  const view = await render(<NavMenu platform="mobile" />);
  fireEvent.press(view.getByRole("button", { name: "Open navigation menu" }));
  expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "OPEN_DRAWER" }));
});
```

Mock `usePathname` as `/task`, `useRouter`, and parent `useNavigation("/(drawer)")`. Mock icon rendering only; do not mock `NavMenu` itself.

- [ ] **Step 2: Run the red test**

```bash
npm test -- --runInBand tests/components/nav-menu-responsive.test.tsx
```

Expected: FAIL because `NavMenu` has no platform/presentation behavior and its current `+` button opens the Drawer.

- [ ] **Step 3: Implement the responsive menu**

Add `labelVisibility` to `TabButton` and always expose an `accessibilityLabel` equal to the destination label, even when its visible text is hidden. `NavMenu` receives optional `platform` for deterministic tests and otherwise derives it from `Platform.OS`. It calls `getNavigationPresentation`, passes `"always"` to web buttons, and passes `"active"` only to the active mobile button; inactive mobile buttons render icon-only.

Replace the current circular Drawer trigger with a button using the `menu-outline` icon and `accessibilityLabel="Open navigation menu"`. Keep its handler as `navigation.dispatch(DrawerActions.openDrawer())`. Do not add creation actions to this component.

- [ ] **Step 4: Verify and commit**

```bash
npm test -- --runInBand tests/components/nav-menu-responsive.test.tsx tests/components/nav-menu.test.tsx
npx tsc --noEmit
npm run lint
git add components/tab-buttons.tsx components/nav-menu.tsx tests/components/nav-menu-responsive.test.tsx
git commit -m "feat: add responsive primary navigation"
```

### Task 3: Add the Task-local floating creation menu

**Files:**
- Create: `components/task-create-menu.tsx`, `tests/components/task-create-menu.test.tsx`, `tests/routes/task-create-route.test.tsx`
- Modify: `app/(drawer)/(task)/task.tsx`, `app/(drawer)/(task)/create.tsx`

**Interfaces:**
- Produces: `TASK_CREATION_KIND` (`"task" | "reminder" | "recurring"`) and `TaskCreateMenu`.
- Consumes: Expo Router `router.push({ pathname: "/create", params: { kind } })`.

- [ ] **Step 1: Write failing floating-menu tests**

```tsx
it("opens the creation menu and routes New task to the create route", async () => {
  const view = await render(<TaskCreateMenu />);
  fireEvent.press(view.getByRole("button", { name: "Create more items" }));
  fireEvent.press(view.getByRole("button", { name: "New task" }));

  expect(mockPush).toHaveBeenCalledWith({ pathname: "/create", params: { kind: "task" } });
  expect(view.queryByRole("button", { name: "Reminder" })).toBeNull();
});

it.each([
  ["Reminder", "reminder"],
  ["Recurring task", "recurring"],
])("routes %s using kind %s", async (label, kind) => {
  // open the menu, select label, assert router.push receives `kind`
});
```

- [ ] **Step 2: Run the red test**

```bash
npm test -- --runInBand tests/components/task-create-menu.test.tsx
```

Expected: FAIL because `TaskCreateMenu` does not exist.

- [ ] **Step 3: Implement focused creation controls and route state**

Create a const-derived action list:

```ts
export const TASK_CREATION_KIND = {
  TASK: "task",
  REMINDER: "reminder",
  RECURRING: "recurring",
} as const;
```

`TaskCreateMenu` holds `isOpen` state. The `Create more items` FAB toggles the menu. The open menu renders the three named action buttons. Selection sets `isOpen` false, then calls `router.push` with `/create` and the selected `kind`.

Render `<TaskCreateMenu />` alongside `<NavMenu />` in `task.tsx`, positioned above the bottom navigation so their hit targets do not overlap. In `create.tsx`, validate `useLocalSearchParams().kind`; show `Create task`, `Create reminder`, or `Create recurring task`, and fall back to `Create task` for absent/unknown values.

- [ ] **Step 4: Verify route fallback and all menu behavior**

```bash
npm test -- --runInBand tests/components/task-create-menu.test.tsx tests/routes/task-create-route.test.tsx
npm test -- --runInBand
npx tsc --noEmit
npm run lint
```

Expected: the three action URLs are correct, the menu closes after selection, and unknown create kinds safely default to a task.

- [ ] **Step 5: Commit**

```bash
git add app/(drawer)/(task)/task.tsx app/(drawer)/(task)/create.tsx components/task-create-menu.tsx tests/components/task-create-menu.test.tsx tests/routes/task-create-route.test.tsx
git commit -m "feat: add task creation action menu"
```

## Self-Review

- **Spec coverage:** Task 1 implements mobile capping and Drawer-only overflow; Task 2 implements web/mobile labels and a dedicated Drawer Menu control; Task 3 implements the isolated Task creation menu and all three create flows.
- **Placeholder scan:** The plan has concrete file paths, APIs, test names, commands, assertions, and commit scopes; it contains no unresolved markers.
- **Type consistency:** `NavigationPresentation` is consumed by `NavMenu`; `labelVisibility` is consumed by `TabButton`; `TASK_CREATION_KIND` supplies the query parameter consumed by `/create`.
