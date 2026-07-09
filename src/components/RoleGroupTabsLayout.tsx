import { Brand } from "@/constants/theme";
import { HeaderBar } from "@/components/HeaderBar";
import { SettingsAction } from "@/components/SettingsAction";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router, Tabs } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, type PressableProps, StyleSheet, Text, View } from "react-native";

type TabBarButtonProps = PressableProps & {
  children: React.ReactNode;
  isAddTab?: boolean;
  label?: string;
  accessibilityState?: { selected?: boolean };
};

function TabBarButton({
  children,
  onPress,
  onLongPress,
  accessibilityState,
  isAddTab,
  label,
}: TabBarButtonProps) {
  const isSelected = accessibilityState?.selected ?? false;

  if (isAddTab) {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.tabButton}
      >
        <View style={styles.addCircle}>
          <Ionicons name="add" size={30} color={Brand.buttonPrimaryText} />
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
        {isSelected && label ? (
          <Text style={styles.activeLabel} numberOfLines={1}>
            {label}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

type RoleGroupTabsLayoutProps =
  | { addVideosMode: "picker"; showAddVideos?: boolean; showFavorites?: boolean }
  | {
      addVideosMode: "navigate";
      groupBasePath: "/(pro)" | "/(club)";
      showAddVideos?: boolean;
      showFavorites?: boolean;
    };

export function RoleGroupTabsLayout(props: RoleGroupTabsLayoutProps) {
  const { t } = useTranslation();
  const showAddVideos = props.showAddVideos ?? true;
  const showFavorites = props.showFavorites ?? true;
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
        tabBarInactiveTintColor: Brand.white,
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
          tabBarButton: (tabProps) => (
            <TabBarButton {...tabProps} label={t("tabs.home")} />
          ),
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
          tabBarButton: (tabProps) => (
            <TabBarButton {...tabProps} label={t("tabs.search")} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites/index"
        options={
          showFavorites
            ? {
                title: t("tabs.favorites"),
                tabBarLabel: t("tabs.favorites"),
                tabBarIcon: ({ focused, color }) => (
                  <Ionicons
                    name={focused ? "star" : "star-outline"}
                    size={22}
                    color={color}
                  />
                ),
                tabBarButton: (tabProps) => (
                  <TabBarButton {...tabProps} label={t("tabs.favorites")} />
                ),
              }
            : { href: null }
        }
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          headerShown: true,
          header: () => (
            <HeaderBar compact rightIcon={<SettingsAction />} />
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
          tabBarButton: (tabProps) => (
            <TabBarButton {...tabProps} label={t("tabs.profile")} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Brand.tabBarBg,
    borderTopWidth: 0,
    borderRadius: 28,
    marginHorizontal: 8,
    marginBottom: 22,
    height: 64,
    paddingBottom: 0,
    elevation: 8,
    shadowColor: Brand.black,
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    position: "absolute",
    overflow: "visible",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  tabInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 56,
    height: 56,
    paddingHorizontal: 12,
    borderRadius: 28,
    gap: 10,
  },
  tabInnerActive: {
    backgroundColor: "transparent",
  },
  addCircle: {
    width: 100,
    height: 64,
    borderRadius: 28,
    backgroundColor: Brand.tabBarActiveBg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  activeLabel: {
    color: Brand.green,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
  },
});
