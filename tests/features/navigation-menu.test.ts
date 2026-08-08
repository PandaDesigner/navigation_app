import { navigationItems } from "@/constant/item-nav";
import { getNavigationPresentation } from "@/features/navigation/navigation-menu";
import type { NavigationItems } from "@/models/menu-models";

const itemsWithFivePrimaryDestinations = [
  ...navigationItems,
  {
    id: "reports",
    label: "Reports",
    href: "/reports",
    drawerRoute: "reports",
    tabIcon: "bar-chart-outline",
    drawerIcon: "bar-chart-outline",
    showInNavMenu: true,
    showInDrawer: true,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    drawerRoute: "settings",
    tabIcon: "settings-outline",
    drawerIcon: "settings-outline",
    showInNavMenu: true,
    showInDrawer: true,
  },
] as unknown as NavigationItems;

describe("getNavigationPresentation", () => {
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
});
