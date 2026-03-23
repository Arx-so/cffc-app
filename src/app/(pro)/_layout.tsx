import { HeaderBar } from "@/components/HeaderBar";
import { SettingsAction } from "@/components/SettingsAction";
import { Brand } from "@/constants/theme";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

export default function ProTabLayout() {
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
          title: "Início",
          tabBarLabel: "Início",
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          headerShown: true,
          header: () => (
            <HeaderBar
              title={t("profile.title")}
              rightIcon={<SettingsAction />}
            />
          ),
          tabBarLabel: "Perfil",
        }}
      />
    </Tabs>
  );
}
