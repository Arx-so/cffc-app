import { useAuthStore } from "@/stores/authStore";
import { router } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { SettingItem, UseSettingsReturn } from "./Settings.types";

export const useSettings = (): UseSettingsReturn => {
  const { t } = useTranslation();
  const signOut = useAuthStore((state) => state.signOut);

  const handleSignOut = useCallback(async() => {
    await signOut();

    router.replace("/login")
  }, [signOut]);

  const items: SettingItem[] = [
    {
      icon: "log-out-outline",
      label: t("settings.signOut"),
      onPress: handleSignOut,
      destructive: true,
    },
  ];

  return { items };
};
