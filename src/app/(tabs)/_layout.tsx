import { HeaderBar } from "@/components/HeaderBar";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
        name="search/index"
        options={{
          title: "Buscar",
          tabBarLabel: "Buscar",
        }}
      />
      <Tabs.Screen
        name="add-videos/index"
        options={{
          title: "Adicionar vídeos",
          tabBarLabel: "Adicionar vídeos",
        }}
      />
      <Tabs.Screen
        name="favorites/index"
        options={{
          title: "Favoritos",
          tabBarLabel: "Favoritos",
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          headerShown: true,
          header: () => (
            <HeaderBar
              title={t("profile.title")}
              rightIcon="settings-2-outline"
            />
          ),
          tabBarLabel: "Perfil",
        }}
      />
    </Tabs>
  );
}
