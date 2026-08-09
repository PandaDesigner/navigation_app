import { TaskHeaderMenu } from "@/components/task-header-menu";
import { AnimatedDrawerContent } from "@/components/animated-drawer-content";
import { navigationItems } from '@/constant/item-nav';
import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
    return (
        <Drawer
            drawerContent={(props) => <AnimatedDrawerContent {...props} />}
            screenOptions={{
                drawerType: "slide",
                overlayColor: "rgba(15, 23, 42, 0.35)",
                sceneStyle: { backgroundColor: "#ffffff" },
                headerShown: true,
                headerStyle: { backgroundColor: "#FCFBFD" },
                headerTintColor: "#565267",
                headerTitleAlign: "left",
                headerTitleStyle: { fontSize: 24, fontWeight: "700", color: "#4B3F66" },
                headerShadowVisible: false,
                headerRight: () => <TaskHeaderMenu />
            }}
        >
            {
                navigationItems.map(({ drawerRoute, label }) => {
                    return <Drawer.Screen key={drawerRoute} name={drawerRoute} options={{ title: label }} />;
                })
            }
        </Drawer>
    );
}
