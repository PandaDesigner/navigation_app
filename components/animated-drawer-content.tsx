import { Ionicons } from "@expo/vector-icons";
import {
  type DrawerContentComponentProps,
  useDrawerProgress,
} from "@react-navigation/drawer";
import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

import { drawerMenuItems } from "@/constant/item-nav";

type DrawerItemProps = {
  focused: boolean;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  index: number;
  label: string;
  onPress: () => void;
};

function DrawerItem({ focused, icon, index, label, onPress }: DrawerItemProps) {
  const progress = useDrawerProgress();
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
    transform: [
      {
        translateX: interpolate(progress.value, [0, 1], [-24 - index * 10, 0]),
      },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        onPress={onPress}
        className={`mb-3 flex-row items-center gap-3 rounded-2xl px-4 py-4 ${focused ? "bg-zinc-800" : "bg-zinc-100"
          }`}
      >
        <Ionicons name={icon} size={22} color={focused ? "#ffffff" : "#52525b"} />
        <Text className={focused ? "font-semibold text-white" : "font-semibold text-zinc-700"}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function AnimatedDrawerContent({ navigation, state }: DrawerContentComponentProps) {
  const router = useRouter();
  const activeRouteName = state.routeNames[state.index];

  return (
    <View className="flex-1 bg-white px-5 pt-16">
      <Text className="mb-2 text-2xl font-bold text-zinc-900">Navigation</Text>
      <Text className="mb-10 text-zinc-500">Choose a view</Text>
      {drawerMenuItems.map((item, index) => (
        <DrawerItem
          key={item.id}
          focused={activeRouteName === item.drawerRoute}
          icon={item.drawerIcon}
          index={index}
          label={item.label}
          onPress={() => {
            router.replace(item.href);
            navigation.closeDrawer();
          }}
        />
      ))}
    </View>
  );
}
