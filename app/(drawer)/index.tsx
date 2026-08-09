import NavMenu from '@/components/nav-menu';
import { navigationItems } from '@/constant/item-nav';
import { usePathname } from 'expo-router';
import { Text, View } from 'react-native';

export default function DrawerPage() {
    const pathname = usePathname()

    return (
        <View className="flex-1 items-center justify-center bg-white">
            <Text className="text-xl font-bold text-[#4B3E67]">
                {(navigationItems.find(item => item.href === pathname) ?? navigationItems[0]).label}
            </Text>
            <NavMenu />
        </View >
    );
}
