import { HeaderBar } from "@/components/HeaderBar";
import { SettingsAction } from "@/components/SettingsAction";
import { Brand } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, Tabs } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, type PressableProps, StyleSheet, View } from "react-native";

type TabBarButtonProps = PressableProps & {
  children: React.ReactNode;
  isAddTab?: boolean;
  accessibilityState?: { selected?: boolean };
};

function TabBarButton({
  children,
  onPress,
  onLongPress,
  accessibilityState,
  isAddTab,
}: TabBarButtonProps) {
  const isSelected = accessibilityState?.selected ?? false;

  if (isAddTab) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.addTabButton}
      >
        <View style={styles.addCircle}>
          <Ionicons name="add" size={24} color={Brand.bg} />
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
    >
      <View style={[styles.tabInner, isSelected && styles.tabInnerActive]}>
        {children}
      </View>
    </Pressable>
  );
}

type RoleGroupTabsLayoutProps =
  | { addVideosMode: "picker"; showAddVideos?: boolean }
  | {
      addVideosMode: "navigate";
      groupBasePath: "/(pro)" | "/(club)";
      showAddVideos?: boolean;
    };

export function RoleGroupTabsLayout(props: RoleGroupTabsLayoutProps) {
  const { t } = useTranslation();
  const showAddVideos = props.showAddVideos ?? true;
  const addVideosNavigateBase =
    props.addVideosMode === "navigate" ? props.groupBasePath : null;

  const handleAddVideosPress = useCallback(async () => {
    if (addVideosNavigateBase) {
      router.push(`${addVideosNavigateBase}/add-videos`);
      return;
    }

    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      router.push(
        `/add-video?videoUri=${encodeURIComponent(result.assets[0].uri)}`,
      );
    }
  }, [addVideosNavigateBase]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Brand.green,
        tabBarInactiveTintColor: Brand.gray,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="add-videos/index"
        options={
          showAddVideos
            ? {
                title: t("tabs.addVideos"),
                tabBarButton: (tabProps) => (
                  <TabBarButton
                    {...tabProps}
                    isAddTab
                    onPress={handleAddVideosPress}
                  />
                ),
              }
            : { href: null }
        }
      />
      <Tabs.Screen
        name="home/index"
        options={{
          title: t("tabs.home"),
          tabBarLabel: t("tabs.home"),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color}
            />
          ),
          tabBarButton: (tabProps) => <TabBarButton {...tabProps} />,
        }}
      />
      <Tabs.Screen
        name="search/index"
        options={{
          title: t("tabs.search"),
          tabBarLabel: t("tabs.search"),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "compass" : "compass-outline"}
              size={22}
              color={color}
            />
          ),
          tabBarButton: (tabProps) => <TabBarButton {...tabProps} />,
        }}
      />
      <Tabs.Screen
        name="favorites/index"
        options={{
          title: t("tabs.favorites"),
          tabBarLabel: t("tabs.favorites"),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "star" : "star-outline"}
              size={22}
              color={color}
            />
          ),
          tabBarButton: (tabProps) => <TabBarButton {...tabProps} />,
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
          title: t("tabs.profile"),
          tabBarLabel: t("tabs.profile"),
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={22}
              color={color}
            />
          ),
          tabBarButton: (tabProps) => <TabBarButton {...tabProps} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Brand.card,
    borderTopWidth: 0,
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 20,
    height: 64,
    paddingBottom: 0,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    position: "absolute",
    overflow: "visible",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tabInnerActive: {
    backgroundColor: Brand.card,
  },
  addTabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  addCircle: {
    width: 42,
    height: 42,
    borderRadius: 28,
    backgroundColor: Brand.green,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Brand.green,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
