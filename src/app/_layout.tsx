import "@/config/i18n";

import * as WebBrowser from "expo-web-browser";
// Required to properly close the in-app browser after OAuth redirects (web support).
WebBrowser.maybeCompleteAuthSession();

import * as eva from "@eva-design/eva";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import { HeaderBar } from "@/components/HeaderBar";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, View } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";
import ToastContainer from "react-native-toast-message";

import { darkTheme, lightTheme } from "@/config/themes";
import { Brand } from "@/constants/theme";
import { UserRole } from "@/processes/types/profileTypes";
import { useAuthStore } from "@/stores/authStore";
import i18n from "@/config/i18n";
import { useLanguageStore } from "@/stores/languageStore";
import { useEffectiveTheme } from "@/stores/themeStore";

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,   // data is always stale — always refetch on mount
      gcTime: 0,      // no cache kept after component unmounts
      refetchOnMount: true,
      refetchOnWindowFocus: false, // not relevant on mobile
    },
  },
});

const ROLE_GROUPS = ["(athlete)", "(pro)", "(club)", "(admin)"] as const;
const UNAUTHENTICATED_SCREENS = ["index", "login", "signup", "forgot-password"] as const;

const ROLE_ROUTES: Record<UserRole, string> = {
  athlete: "/(athlete)/home",
  pro: "/(pro)/home",
  club: "/(club)/home",
  admin: "/(admin)/home",
};

const RootLayoutNav = () => {
  const { isAuthenticated, isLoading, role, checkAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const { t } = useTranslation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isLoading) return;

    SplashScreen.hideAsync();

    const inRoleGroup = (ROLE_GROUPS as readonly string[]).includes(
      segments[0] as string,
    );

    // Root welcome is `app/index.tsx`; Expo Router strips the trailing `index` segment,
    // so `segments` is [] and `segments[0]` is never `"index"` — detect via pathname.
    const onUnauthenticatedScreen =
      pathname === "/" ||
      (UNAUTHENTICATED_SCREENS as readonly string[]).includes(segments[0] as string);

    if (isAuthenticated && role && onUnauthenticatedScreen) {
      router.replace(ROLE_ROUTES[role] as any);
    } else if (!isAuthenticated && inRoleGroup) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, pathname, role, segments, router]);

  if (isLoading) {
    return (
      <View style={{ alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: Brand.bg }}>
        <ActivityIndicator size="large" color={Brand.green} />
      </View>
    );
  }

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerBackTitle: "",
        contentStyle: { backgroundColor: Brand.bg },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false, title: "" }} />
      <Stack.Screen name="login" options={{ headerBackTitle: "" }} />
      <Stack.Screen name="signup" options={{ headerBackTitle: "" }} />
      <Stack.Screen name="forgot-password" options={{ headerBackTitle: "" }} />
      {/* Deep link target of the recovery email. Deliberately absent from
          UNAUTHENTICATED_SCREENS: the recovery link creates a session, and the
          guard would otherwise bounce the user to their role home before they
          can set a new password. */}
      <Stack.Screen name="reset-password" options={{ headerBackTitle: "" }} />
      <Stack.Screen
        name="(athlete)"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="(pro)"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="(club)"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="(admin)"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          headerShown: true,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="add-video"
        options={{
          headerShown: true,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="search-filter"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="visitor-profile"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="user-feed"
        options={{ headerShown: false, presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="emit-validation"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          header: () => (
            <HeaderBar
              title={t("settings.title")}
              leftIcon="arrow-back-outline"
              onLeftPress={() => router.back()}
            />
          ),
        }}
      />
    </Stack>
  );
};

const RootLayout = () => {
  const effectiveTheme = useEffectiveTheme();
  const language = useLanguageStore((state) => state.language);
  const theme = effectiveTheme === "dark" ? darkTheme : lightTheme;

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider mapping={eva.mapping} theme={theme}>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <RootLayoutNav />
            <StatusBar style={effectiveTheme === "dark" ? "light" : "dark"} />
            <ToastContainer bottomOffset={130} position="bottom" />
          </QueryClientProvider>
        </KeyboardProvider>
      </ApplicationProvider>
    </>
  );
};

export default RootLayout;
