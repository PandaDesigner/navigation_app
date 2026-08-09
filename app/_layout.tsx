import { navigationItems } from '@/constant/item-nav';
import { Ionicons } from "@expo/vector-icons";
import { Stack, usePathname } from "expo-router";
import { Pressable, Text } from 'react-native';
import "../global.css";

export default function RootLayout() {
  const pathname = usePathname();
  const activeItem = navigationItems.find((item) => item.href === pathname) ?? navigationItems[0];
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#FCFBFD" },
        headerTintColor: "#565267",
        headerTitleStyle: { fontWeight: "700", color: "#4B3F66" },
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerShown: false,
        headerLeft: ({ canGoBack, tintColor }) => {
          if (!canGoBack) return null;
          return (<Pressable
            className="flex-row items-center gap-0 px-3 py-2"
          >
            <Ionicons name="chevron-back" size={24} color="#565267" />
            <Text className="text-[#565267] text-lg ml-4">Back</Text>
          </Pressable>)
        }
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="(drawer)"
        options={{
          headerShown: false,
          title: activeItem.label,
        }}
      />
    </Stack>
  );
}
