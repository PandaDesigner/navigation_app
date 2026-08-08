import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

const titles = {
  task: "Create task",
  reminder: "Create reminder",
  recurring: "Create recurring task",
} as const;

export default function CreateTaskPage() {
  const { kind } = useLocalSearchParams<{ kind?: string }>();
  const title = kind && kind in titles ? titles[kind as keyof typeof titles] : titles.task;

  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}
