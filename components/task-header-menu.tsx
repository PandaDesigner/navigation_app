import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { Pressable } from "react-native";

export function TaskHeaderMenu() {
  const navigation = useNavigation();
  return <Pressable accessibilityRole="button" accessibilityLabel="Open navigation menu" onPress={() => navigation.dispatch(DrawerActions.openDrawer())} className="mr-2 rounded-full p-2"><Ionicons name="grid-outline" size={26} color="#565267" /></Pressable>;
}
