import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export const TASK_CREATION_KIND = {
  TASK: "task",
  REMINDER: "reminder",
  RECURRING: "recurring",
} as const;

type TaskCreationKind = (typeof TASK_CREATION_KIND)[keyof typeof TASK_CREATION_KIND];

const actions: readonly { label: string; kind: TaskCreationKind }[] = [
  { label: "New task", kind: TASK_CREATION_KIND.TASK },
  { label: "Reminder", kind: TASK_CREATION_KIND.REMINDER },
  { label: "Recurring task", kind: TASK_CREATION_KIND.RECURRING },
];

export function TaskCreateMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const selectAction = (kind: TaskCreationKind) => {
    setIsOpen(false);
    router.push({ pathname: "/create", params: { kind } });
  };

  return (
    <View className="absolute bottom-28 right-5 items-end gap-3">
      {isOpen ? actions.map((action) => (
        <Pressable
          key={action.kind}
          accessibilityRole="button"
          onPress={() => selectAction(action.kind)}
          className="rounded-full bg-zinc-800 px-5 py-3"
        >
          <Text className="font-semibold text-white">{action.label}</Text>
        </Pressable>
      )) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create more items"
        onPress={() => setIsOpen((open) => !open)}
        className="rounded-full bg-zinc-800 p-4"
      >
        <Ionicons name={isOpen ? "close" : "add"} size={28} color="#ffffff" />
      </Pressable>
    </View>
  );
}
