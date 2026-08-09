import type { NavigationItems } from "@/models/menu-models";

import {
  MOBILE_PRIMARY_NAVIGATION_LIMIT,
  type NavigationPlatform,
  type NavigationPresentation,
} from "./navigation-menu-types";

export function getNavigationPresentation(
  items: NavigationItems,
  platform: NavigationPlatform,
): NavigationPresentation {
  const primaryCandidates = items.filter((item) => item.showInNavMenu);

  if (platform === "web") {
    return { primary: primaryCandidates, drawerOnly: [] };
  }

  return {
    primary: primaryCandidates.slice(0, MOBILE_PRIMARY_NAVIGATION_LIMIT),
    drawerOnly: primaryCandidates
      .slice(MOBILE_PRIMARY_NAVIGATION_LIMIT)
      .filter((item) => item.showInDrawer),
  };
}
