import NavMenu from "@/components/nav-menu";
import { TaskCreateMenu } from "@/components/task-create-menu";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, Text, TextInput, View } from "react-native";

const tasks = [
  ["wifi-outline", "Pagar internet", "Hoy, 09:00", "Vencida", "$89.900"],
  ["document-text-outline", "Enviar propuesta de diseño", "Hoy, 11:00", "En progreso", ""],
  ["color-palette-outline", "Finalizar diseño UI", "Mañana, 17:00", "En progreso", "$214.900"],
  ["cart-outline", "Comprar mercado familiar", "Dom, 28 abr, 10:00", "Pendiente", "$250.000"],
  ["heart-outline", "Cita médica anual", "Lun, 29 abr, 09:00", "Pendiente", ""],
] as const;

export default function TaskPage() {
  return <View className="flex-1 bg-[#FCFBFD] px-4 pt-16">
    <View className="mb-6 flex-row items-center justify-between"><Text className="text-4xl font-bold text-[#4B3F66]">Tareas</Text><Ionicons name="options-outline" size={28} color="#4B3F66" /></View>
    <View className="mb-5 flex-row items-center rounded-2xl border border-[#E5DFEC] bg-white px-4 py-3"><Ionicons name="search-outline" size={24} color="#625A72" /><TextInput placeholder="Buscar tareas" placeholderTextColor="#8E849F" className="ml-3 flex-1 text-lg text-[#4B3F66]" /></View>
    <View className="mb-5 flex-row overflow-hidden rounded-2xl border border-[#E5DFEC] bg-white"><Text className="flex-1 rounded-2xl bg-[#4B3F66] py-3 text-center font-semibold text-white">Lista</Text><Text className="flex-1 py-3 text-center font-semibold text-[#4B3F66]">Kanban</Text><Text className="flex-1 py-3 text-center font-semibold text-[#4B3F66]">Calendario</Text></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4"><View className="flex-row gap-3"><Text className="rounded-full bg-[#4B3F66] px-5 py-3 font-semibold text-white">Todas</Text>{["Hoy","Próximas","Bloqueadas"].map(x=><Text key={x} className="rounded-full border border-[#E5DFEC] bg-white px-5 py-3 font-semibold text-[#625A72]">{x}</Text>)}</View></ScrollView>
    <ScrollView contentContainerClassName="gap-3 pb-40">{tasks.map(([icon,title,date,status,value])=><View key={title} className="flex-row items-center rounded-2xl border border-[#EAE5F0] bg-white p-4"><View className="mr-3 rounded-full bg-[#F0EBF8] p-3"><Ionicons name={icon} size={26} color="#4B3F66" /></View><View className="flex-1"><Text className="text-lg font-bold text-[#35284F]">{title}</Text><Text className="mt-1 text-base text-[#625A72]">{date}</Text></View><View className="items-end"><Text className={`rounded-full px-3 py-2 font-semibold ${status === "Vencida" ? "bg-[#FCE3E2] text-[#C74B48]" : status === "En progreso" ? "bg-[#EEEAFB] text-[#5D56B8]" : "bg-[#F0EEF3] text-[#625A72]"}`}>{status}</Text>{value ? <Text className="mt-3 text-lg font-bold text-[#35284F]">{value}</Text> : null}</View></View>)}</ScrollView>
    <TaskCreateMenu /><NavMenu />
  </View>;
}
