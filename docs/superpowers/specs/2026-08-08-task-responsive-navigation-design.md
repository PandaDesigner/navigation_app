# Task Responsive Navigation and Creation Actions Design

**Date:** 2026-08-08  
**Status:** Approved for planning

## Goal

Organize the Task view around responsive primary navigation, a dedicated global Drawer control, and a separate floating menu for Task creation actions.

## User Experience

### Primary navigation

- On web, every primary destination allowed in the navigation bar renders its icon and label.
- On mobile, show at most four primary destinations. The selected destination renders its icon and label; every other visible destination renders only its icon.
- Destinations beyond the first four mobile primary destinations do not appear in the mobile navigation bar. They remain reachable through the Drawer only.
- The four-item mobile limit applies only to view destinations, not to the Drawer control or the Task creation control.

### Global navigation control

- A dedicated **Menu** (More) control opens the parent Drawer.
- It is the only navigation-bar control that opens the Drawer.
- Selecting a destination in the Drawer continues to use the public Expo Router URL stored in the navigation item.

### Task creation control

- Task owns a separate floating `+` control.
- It opens a floating creation menu with exactly three actions: **New task**, **Reminder**, and **Recurring task**.
- Selecting an action closes the floating menu and routes to `/create` with the selected creation type.
- The creation menu never opens the Drawer and the Menu control never opens creation actions.

## Architecture

- `NavMenu` owns responsive destination rendering and the global Drawer control only.
- `TaskCreateMenu` is rendered by the Task route and owns expanded/collapsed state for the floating creation menu.
- `TabButton` receives an explicit label-visibility mode instead of inferring presentation from its parent.
- A pure navigation utility derives web-visible, mobile-visible, and Drawer-only destination arrays from `navigationItems`. Mobile-visible items are the first four entries that opt into primary navigation.
- The existing `app/(drawer)/(task)/create.tsx` route consumes a typed creation-kind query parameter. It is the single entry point for all three menu choices.

## Data Flow

1. Navigation configuration declares each destination's URL and primary-navigation eligibility.
2. The derivation utility returns the screen-width-appropriate primary destinations.
3. `NavMenu` renders those destinations and opens the Drawer through the parent navigator.
4. `TaskCreateMenu` maps its fixed creation actions to `/create?kind=<kind>` routes.
5. The create route reads `kind` and presents the corresponding creation entry state.

## Error and Edge Handling

- If fewer than four primary destinations exist, mobile renders only the available entries.
- If no creation type is supplied, `/create` defaults to a normal task creation flow.
- Unknown `kind` parameters safely fall back to a normal task creation flow.
- Pressing a creation action while the menu is open must close it before navigation, preventing stale overlay state when the user returns.

## Testing

- Unit-test the derivation utility for the four-item mobile cap and overflow Drawer-only behavior.
- Component-test web labels, mobile active-label behavior, and icon-only inactive items.
- Component-test Menu opening the parent Drawer separately from TaskCreateMenu.
- Component-test the three floating actions, menu closing, and URLs sent to the create route.
- Preserve the existing URL-based Drawer navigation regression coverage.

## Non-goals

- Implementing the final task, reminder, or recurring-task form fields.
- Adding persistence, notifications, or task scheduling behavior.
- Replacing the Drawer, changing the existing Task route URL, or adding more than three creation actions.
