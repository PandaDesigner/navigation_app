import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, usePathname, useRouter } from "expo-router";
import { Pressable, View } from "react-native";

import { navMenuItems } from "@/constant/item-nav";
import { TabButton } from "./tab-buttons";

const NavMenu = () => {
    const navigation = useNavigation();
    const pathname = usePathname();
    const router = useRouter();

    return (
        <View className="absolute bottom-8 left-5 right-5 flex-row items-center justify-between">
            <View className="flex-row rounded-full bg-zinc-100 p-2">
                {navMenuItems.map((item) => (
                    <TabButton
                        key={item.id}
                        icon={item.tabIcon}
                        label={item.label}
                        active={pathname === item.href}
                        onPress={() => router.replace(item.href)}
                    />
                ))}
            </View>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Create a new item"
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                className="rounded-full bg-zinc-100 p-4"
            >
                <Ionicons name="add" size={30} color="#737373" />
            </Pressable>
        </View>
    );
};

export default NavMenu;
