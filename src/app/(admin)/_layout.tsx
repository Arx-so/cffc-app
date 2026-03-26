import { Brand } from "@/constants/theme";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

export default function AdminTabLayout() {
  const { t } = useTranslation();

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
          title: t("tabs.home"),
          tabBarLabel: t("tabs.home"),
        }}
      />
    </Tabs>
  );
}
