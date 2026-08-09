import { TaskHeaderMenu } from "@/components/task-header-menu";
import { Stack } from "expo-router";

export default function TaskLayout() {
  return <Stack screenOptions={{ headerShown: true, headerStyle: { backgroundColor: "#FCFBFD" }, headerShadowVisible: false, headerTintColor: "#4B3F66", headerTitleStyle: { fontWeight: "700" }, headerRight: () => <TaskHeaderMenu /> }}><Stack.Screen name="task" options={{ title: "Tareas" }} /><Stack.Screen name="create" options={{ title: "Crear tarea" }} /><Stack.Screen name="detail/[id]" options={{ title: "Detalle" }} /></Stack>;
}
