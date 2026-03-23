import { Brand } from "@/constants/theme";
import { Tabs } from "expo-router";

export default function AdminTabLayout() {
  return (
    <Tabs
      sceneContainerStyle={{ backgroundColor: Brand.bg }}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: Brand.bg, borderTopColor: Brand.border },
        tabBarActiveTintColor: Brand.green,
        tabBarInactiveTintColor: Brand.gray,
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Início",
          tabBarLabel: "Início",
        }}
      />
    </Tabs>
  );
}
