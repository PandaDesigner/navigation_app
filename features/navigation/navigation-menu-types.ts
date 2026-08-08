import type { NavigationItem } from "@/models/menu-models";

export const MOBILE_PRIMARY_NAVIGATION_LIMIT = 4 as const;

export type NavigationPlatform = "web" | "mobile";

export interface NavigationPresentation {
  primary: readonly NavigationItem[];
  drawerOnly: readonly NavigationItem[];
}
