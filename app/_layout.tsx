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
        headerStyle: { backgroundColor: "#111827" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: 300 },
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerShown: true,
        headerLeft: ({ canGoBack, tintColor }) => {
          if (!canGoBack) return null;
          return (<Pressable
            className="flex-row items-center gap-0 px-3 py-2"
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
            <Text className="text-white text-lg ml-4">Back</Text>
          </Pressable>)
        }
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="(drawer)"
        options={{
          headerShown: true,
          title: activeItem.label,
        }}
      />
    </Stack>
  );
}
