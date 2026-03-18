import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Início',
          // Force the label shown in the bottom tab bar.
          // This avoids fallback labels like "home/index".
          tabBarLabel: 'Início',
        }}
      />
      <Tabs.Screen
        name="search/index"
        options={{
          title: 'Buscar',
          tabBarLabel: 'Buscar',
        }}
      />
      <Tabs.Screen
        name="add-videos/index"
        options={{
          title: 'Adicionar vídeos',
          tabBarLabel: 'Adicionar vídeos',
        }}
      />
      <Tabs.Screen
        name="favorites/index"
        options={{
          title: 'Favoritos',
          tabBarLabel: 'Favoritos',
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Perfil',
          tabBarLabel: 'Perfil',
        }}
      />
    </Tabs>
  );
}
