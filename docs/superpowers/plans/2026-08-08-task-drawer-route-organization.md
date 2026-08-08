# Task Drawer Route Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nest the Task route group in the Drawer so the Task board remains organized with future Task views and the Drawer reliably opens from and routes to Task.

**Architecture:** Move the current sibling `app/(task)` route group below `app/(drawer)`, where a Task-local Stack owns board, create, and detail routes. The Drawer registers the nested group and navigation uses public Expo Router paths; `NavMenu` resolves the parent Drawer explicitly before dispatching `openDrawer`.

**Tech Stack:** Expo SDK 54, Expo Router 6, React Native 0.81, TypeScript strict, Jest 29, jest-expo, React Native Testing Library.

## Global Constraints

- Use the installed Expo SDK `~54.0.35` and Expo Router `~6.0.24`; do not use SDK 56+ migration APIs.
- Keep Task screens inside `app/(drawer)/(task)/`; route-group names must not appear in public URLs.
- Preserve `/task` as the Task board URL and `/home` as the Home URL.
- Do not add data persistence, Supabase, task business logic, or a second Drawer.
- Use Jest/jest-expo and place test files under `tests/`, never under `app/`.
- Do not overwrite unrelated local modifications in `app/(task)/task.tsx`, `app/_layout.tsx`, or `constant/item-nav.ts`; reconcile them deliberately in the migration task.

---

## File Structure

- `app/(drawer)/_layout.tsx` — registers Wallet, Home, and nested Task Drawer destinations.
- `app/(drawer)/(task)/_layout.tsx` — owns the Task-local Stack.
- `app/(drawer)/(task)/task.tsx` — Task board entry at `/task`.
- `app/(drawer)/(task)/create.tsx` — create-task route placeholder at `/create`.
- `app/(drawer)/(task)/detail/[id].tsx` — task detail/edit route placeholder at `/detail/:id`.
- `app/_layout.tsx` — removes the obsolete sibling Task Stack registration.
- `constant/item-nav.ts` — maps the Task menu item to the nested Drawer group while retaining `href: "/task"`.
- `components/nav-menu.tsx` — opens the enclosing Drawer from nested Task Stack screens.
- `jest.config.js` — discovers both `.test.ts` and `.test.tsx` tests.
- `tests/routes/task-drawer-route.test.tsx` — guards public Task path and group nesting.
- `tests/components/nav-menu.test.tsx` — guards Drawer-opening behavior from a nested route.

### Task 1: Establish routing regression coverage

**Files:**
- Create: `tests/routes/task-drawer-route.test.tsx`
- Create: `tests/components/nav-menu.test.tsx`
- Modify: `jest.config.js`

**Interfaces:**
- Consumes: Expo Router `renderRouter`, `screen`, `NavMenu`.
- Produces: `.tsx` test discovery and failing assertions that describe `/task` and parent-Drawer behavior.

- [ ] **Step 1: Write the failing route-group test**

```tsx
import { renderRouter, screen } from "expo-router/testing-library";

it("resolves the nested Task route at the public /task path", () => {
  renderRouter(
    {
      "(drawer)/_layout": () => null,
      "(drawer)/(task)/_layout": () => null,
      "(drawer)/(task)/task": () => null,
    },
    { initialUrl: "/task" },
  );

  expect(screen).toHavePathname("/task");
});
```

- [ ] **Step 2: Write the failing parent Drawer test**

```tsx
import { render } from "@testing-library/react-native";
import NavMenu from "@/components/nav-menu";

const dispatch = jest.fn();
jest.mock("expo-router", () => ({
  useNavigation: () => ({ dispatch }),
  usePathname: () => "/task",
  useRouter: () => ({ replace: jest.fn() }),
}));

it("dispatches an open-drawer action from a Task route", () => {
  const { getByLabelText } = render(<NavMenu />);
  fireEvent.press(getByLabelText("Create a new item"));
  expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "OPEN_DRAWER" }));
});
```

Add `fireEvent` to the test import and mock `@/components/tab-buttons` with a null component so the test focuses on the menu action.

- [ ] **Step 3: Enable TypeScript React test discovery and run the red tests**

Change `jest.config.js` to:

```js
module.exports = {
  preset: "jest-expo",
  roots: ["<rootDir>/tests"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
};
```

Run:

```bash
npm test -- --runInBand tests/routes/task-drawer-route.test.tsx tests/components/nav-menu.test.tsx
```

Expected: FAIL because the nested Task group and its parent-Drawer lookup do not yet exist.

- [ ] **Step 4: Commit the red-test baseline**

```bash
git add jest.config.js tests/routes/task-drawer-route.test.tsx tests/components/nav-menu.test.tsx
git commit -m "test: cover task drawer routing"
```

### Task 2: Nest Task under the Drawer and preserve public routes

**Files:**
- Create: `app/(drawer)/(task)/_layout.tsx`, `app/(drawer)/(task)/task.tsx`, `app/(drawer)/(task)/create.tsx`, `app/(drawer)/(task)/detail/[id].tsx`
- Modify: `app/(drawer)/_layout.tsx`, `app/_layout.tsx`, `constant/item-nav.ts`
- Delete: `app/(task)/task.tsx`

**Interfaces:**
- Consumes: `navigationItems`, `Stack`, `Drawer`.
- Produces: Drawer route name `(task)`, public `href: "/task"`, and a Task Stack with `task`, `create`, and `detail/[id]` screens.

- [ ] **Step 1: Move the Task entry before changing navigation configuration**

Create `app/(drawer)/(task)/task.tsx` by moving the current Task screen without changing its rendered board content. Then remove `app/(task)/task.tsx` only after the new file exists.

- [ ] **Step 2: Add the Task-local Stack**

Create `app/(drawer)/(task)/_layout.tsx`:

```tsx
import { Stack } from "expo-router";

export default function TaskLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="task" />
      <Stack.Screen name="create" />
      <Stack.Screen name="detail/[id]" />
    </Stack>
  );
}
```

Create focused route placeholders that render distinct, accessible screen labels:

```tsx
// app/(drawer)/(task)/create.tsx
import { Text, View } from "react-native";
export default function CreateTaskPage() {
  return <View><Text>Create task</Text></View>;
}
```

```tsx
// app/(drawer)/(task)/detail/[id].tsx
import { Text, View } from "react-native";
export default function TaskDetailPage() {
  return <View><Text>Task detail</Text></View>;
}
```

- [ ] **Step 3: Register the group in the Drawer and remove the obsolete root screen**

Set the Task item to the nested Drawer screen name while preserving its public URL:

```ts
{
  id: "task",
  label: "Task",
  href: "/task",
  drawerRoute: "(task)",
  // retain existing icon and visibility fields
}
```

Ensure `app/(drawer)/_layout.tsx` renders `<Drawer.Screen name="(task)" options={{ title: "Task" }} />` through the existing item configuration, and remove `<Stack.Screen name="(task)/task" ... />` from `app/_layout.tsx`. Do not retain two registrations for Task.

- [ ] **Step 4: Run route, type, and lint verification**

Run:

```bash
npm test -- --runInBand tests/routes/task-drawer-route.test.tsx
npx tsc --noEmit
npm run lint
```

Expected: all commands pass; `/task` resolves while its implementation is located in `(drawer)/(task)`.

- [ ] **Step 5: Commit the navigation hierarchy**

```bash
git add app/(drawer) app/_layout.tsx constant/item-nav.ts
git rm app/(task)/task.tsx
git commit -m "feat: nest task routes in drawer"
```

### Task 3: Make NavMenu open the enclosing Drawer from Task screens

**Files:**
- Modify: `components/nav-menu.tsx`
- Modify: `tests/components/nav-menu.test.tsx`

**Interfaces:**
- Consumes: Expo Router `useNavigation("/(drawer)")`, `DrawerActions.openDrawer()`.
- Produces: a menu action that targets the parent Drawer instead of the nearest nested Task Stack.

- [ ] **Step 1: Update the test to assert the parent-layout lookup**

Replace the Expo Router mock with a branch that records its argument:

```tsx
const useNavigation = jest.fn(() => ({ dispatch }));
jest.mock("expo-router", () => ({
  useNavigation,
  usePathname: () => "/task",
  useRouter: () => ({ replace: jest.fn() }),
}));

expect(useNavigation).toHaveBeenCalledWith("/(drawer)");
expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: "OPEN_DRAWER" }));
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
npm test -- --runInBand tests/components/nav-menu.test.tsx
```

Expected: FAIL because `NavMenu` currently obtains the nearest navigator with `useNavigation()`.

- [ ] **Step 3: Target the Drawer layout explicitly**

In `components/nav-menu.tsx`, replace the zero-argument navigation lookup with:

```tsx
const navigation = useNavigation("/(drawer)");
```

Keep `navigation.dispatch(DrawerActions.openDrawer())` as the sole handler for the circular menu action. Keep each bottom-menu item using `router.replace(item.href)` so navigation remains URL-based.

- [ ] **Step 4: Verify complete behavior**

Run:

```bash
npm test -- --runInBand tests/components/nav-menu.test.tsx tests/routes/task-drawer-route.test.tsx
npm test -- --runInBand
npx tsc --noEmit
npm run lint
```

Expected: all commands pass, and the Task board can invoke the parent Drawer without relying on sibling navigator behavior.

- [ ] **Step 5: Commit the Drawer interaction**

```bash
git add components/nav-menu.tsx tests/components/nav-menu.test.tsx
git commit -m "fix: open drawer from task routes"
```

## Self-Review

- **Spec coverage:** Task 1 makes route and Drawer interaction regressions executable; Task 2 nests and registers Task while retaining `/task` and establishing its internal Stack; Task 3 opens the parent Drawer from every Task child.
- **Placeholder scan:** No unresolved markers or generic testing instructions remain; every task identifies exact files, commands, expected results, and implementation snippets.
- **Type consistency:** `drawerRoute: "(task)"` is produced by navigation configuration and consumed by the Drawer; `useNavigation("/(drawer)")` is the single navigation handle used by `NavMenu` to dispatch the open-drawer action.
