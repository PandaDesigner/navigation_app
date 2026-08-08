import type { NavigationItems } from '@/models/menu-models';

export const navigationItems = [
  {
    id: "wallet",
    label: "Wallet",
    href: "/",
    drawerRoute: "index",
    tabIcon: "wallet-outline",
    drawerIcon: "grid-outline",
    showInNavMenu: true,
    showInDrawer: true,
  },
  {
    id: "home",
    label: "Home",
    href: "/home",
    drawerRoute: "home",
    tabIcon: "home-outline",
    drawerIcon: "home-outline",
    showInNavMenu: true,
    showInDrawer: true,
  },
  {
    id: "task",
    label: "Task",
    href: "/task",
    drawerRoute: "task",
    tabIcon: "checkbox-outline",
    drawerIcon: "checkbox-outline",
    showInNavMenu: true,
    showInDrawer: true,
  },
] as const satisfies NavigationItems;

export const navMenuItems = navigationItems.filter((item) => item.showInNavMenu);
export const drawerMenuItems = navigationItems.filter((item) => item.showInDrawer);
