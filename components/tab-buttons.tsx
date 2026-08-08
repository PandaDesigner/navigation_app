import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

type TabButtonProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  active?: boolean;
  labelVisibility?: "always" | "active";
  onPress?: () => void;
};

export function TabButton({
  icon,
  label,
  active = false,
  labelVisibility = "always",
  onPress,
}: TabButtonProps) {
  const showLabel = labelVisibility === "always" || active;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`flex-row items-center gap-2 rounded-full px-4 py-3 ${active ? "bg-zinc-800" : "bg-transparent"}`}
    >
      <Ionicons name={icon} size={22} color={active ? "#ffffff" : "#737373"} />
      {showLabel ? <Text className={active ? "font-semibold text-white" : "text-zinc-500"}>{label}</Text> : null}
    </Pressable>
  );
}
