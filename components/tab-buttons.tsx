// components/tab-button.tsx
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

type TabButtonProps = {
    icon: React.ComponentProps<typeof Ionicons>["name"];
    label: string;
    active?: boolean;
    onPress?: () => void;
};

export function TabButton({
    icon,
    label,
    active = false,
    onPress,
}: TabButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            className={`flex-row items-center gap-2 rounded-full px-4 py-3 ${active
                ? "bg-[#4B3E67]"
                : "bg-transparent"
                }`}
        >
            <Ionicons
                name={icon}
                size={22}
                color={active ? "#ffffff" : "#737373"}
            />
            <Text className={active ? "font-semibold text-white" : "text-[#565267]"}>
                {label}
            </Text>
        </Pressable>
    );
}