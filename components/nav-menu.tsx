import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, usePathname, useRouter } from "expo-router";
import { Platform, Pressable, View } from "react-native";

import { navigationItems } from "@/constant/item-nav";
import { getNavigationPresentation } from "@/features/navigation/navigation-menu";
import type { NavigationPlatform } from "@/features/navigation/navigation-menu-types";

import { TabButton } from "./tab-buttons";

type NavMenuProps = {
  platform?: NavigationPlatform;
};

const NavMenu = ({ platform = Platform.OS === "web" ? "web" : "mobile" }: NavMenuProps) => {
  const navigation = useNavigation("/(drawer)");
  const pathname = usePathname();
  const router = useRouter();
  const { primary } = getNavigationPresentation(navigationItems, platform);

  return (
    <View className="absolute bottom-8 left-5 right-5 flex-row items-center justify-between">
      <View className="flex-row rounded-full bg-[#ece7f6] p-2">
        {primary.map((item) => {
          const active = pathname === item.href;
          return (
            <TabButton
              key={item.id}
              icon={item.tabIcon}
              label={item.label}
              active={active}
              labelVisibility={platform === "web" || active ? "always" : "active"}
              onPress={() => router.replace(item.href)}
            />
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open navigation menu"
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        className="rounded-full bg-[#ece7f6] p-4"
      >
        <Ionicons name="menu-outline" size={30} color="#625A72" />
      </Pressable>
    </View>
  );
};

export default NavMenu;
