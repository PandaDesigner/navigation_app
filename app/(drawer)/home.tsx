import NavMenu from '@/components/nav-menu';
import { Text, View } from "react-native";

export default function HomePage() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold text-blue-500">Home</Text>

      <NavMenu />
    </View>
  );
}
