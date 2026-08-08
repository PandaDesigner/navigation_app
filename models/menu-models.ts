import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof Ionicons>['name'];
export type ItemRouter = "index" | "home" | "task"

export interface NavigationItem {
    id: string,
    label: string,
    href: Href,
    drawerRoute: ItemRouter,
    tabIcon: IconName,
    drawerIcon: IconName,
    showInNavMenu: boolean,
    showInDrawer: boolean,
}

export type NavigationItems = readonly NavigationItem[];
