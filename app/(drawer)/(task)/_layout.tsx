import { Stack } from "expo-router";

export default function TaskLayout() {
  return <Stack screenOptions={{ headerShown: false }}><Stack.Screen name="task" /><Stack.Screen name="create" options={{ title: "Crear tarea" }} /><Stack.Screen name="detail/[id]" options={{ title: "Detalle" }} /></Stack>;
}
