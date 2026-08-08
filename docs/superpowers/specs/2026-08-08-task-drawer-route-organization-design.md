# Task Drawer Route Organization Design

**Date:** 2026-08-08  
**Status:** Approved for planning

## Goal

Keep all Task-related screens in a dedicated Expo Router route group while making the Task entry reachable from the application Drawer and allowing Task screens to open that Drawer.

## Current Problem

`navigationItems` declares `task` as a Drawer destination, but the screen currently lives at `app/(task)/task.tsx`. Because `(task)` is a sibling of `(drawer)`, no Drawer screen named `task` exists. The Drawer attempts `navigation.navigate('task')` and cannot resolve a registered child screen.

## Chosen Structure

```text
app/
  (drawer)/
    _layout.tsx                 # Application Drawer
    index.tsx                   # Wallet
    home.tsx                    # Home
    (task)/
      _layout.tsx               # Task-local Stack
      task.tsx                  # /task, Task board entry
      create.tsx                # /create, create-task flow
      detail/
        [id].tsx                # /detail/:id, task detail/editing
```

Route groups do not participate in the public URL. Therefore the Task board remains reachable at `/task` while `(task)` provides a private organizational and navigation boundary.

## Navigation Design

- `app/(drawer)/_layout.tsx` registers the nested `(task)` navigator as the Drawer child that represents the existing `Task` menu item.
- The custom drawer content routes the Task item to that registered group; it does not attempt to target a sibling Stack route.
- `(task)/_layout.tsx` owns a Stack for the board, creation, and detail/edit routes. It has no second Drawer.
- The Task board's menu control accesses the enclosing Drawer navigator to open it. It must not create a duplicate custom menu or depend on mock-only navigation behavior.
- Cross-feature navigation uses Expo Router public paths (`/home`, `/task`, and later Expense paths), rather than fragile nested navigator screen-name parameters.

## Screen Responsibilities

| Route | Responsibility |
| --- | --- |
| `/task` | Board overview and scope controls; opens the Drawer. |
| `/create` | Creates a Task and returns to its board or detail. |
| `/detail/[id]` | Presents and edits one Task; handles unknown IDs safely. |

The implementation may defer feature UI for `/create` and `/detail/[id]`, but the Task Stack boundary must be in place now so future pages do not change Drawer integration.

## Error Handling

- An unknown task ID renders a clear not-found state rather than crashing.
- The Drawer route is verified in a rendered navigation test so filesystem placement regressions cannot silently break it.

## Testing

- Add a routing/navigation test proving the Task menu item resolves to the Task board.
- Add a test proving the Task board's menu action opens the parent Drawer.
- Preserve existing model tests and strict TypeScript checks.

## Non-goals

- Rebuilding the Task board visual design.
- Adding persistence or Supabase access.
- Implementing all create/detail business interactions before their feature scope is defined.
