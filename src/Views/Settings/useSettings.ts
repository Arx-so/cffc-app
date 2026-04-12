import { useAuthStore } from "@/stores/authStore";
import { Language, useLanguageStore } from "@/stores/languageStore";
import { router } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { SettingItem, UseSettingsReturn } from "./Settings.types";

export const useSettings = (): UseSettingsReturn => {
  const { t } = useTranslation();
  const signOut = useAuthStore((state) => state.signOut);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const languageLabelMap: Record<Language, string> = {
    en: t("settings.langEn"),
    ja: t("settings.langJa"),
    "pt-BR": t("settings.langPtBr"),
  };

  const handleSignOut = useCallback(async() => {
    await signOut();

    router.replace("/login")
  }, [signOut]);

  const handleLanguageSelect = useCallback(() => {
    Alert.alert(t("settings.language"), undefined, [
      {
        text: t("settings.langEn"),
        onPress: () => setLanguage("en"),
      },
      {
        text: t("settings.langPtBr"),
        onPress: () => setLanguage("pt-BR"),
      },
      {
        text: t("settings.langJa"),
        onPress: () => setLanguage("ja"),
      },
      { text: t("common.cancel"), style: "cancel" },
    ]);
  }, [setLanguage, t]);

  const items: SettingItem[] = [
    {
      icon: "globe-2-outline",
      label: t("settings.language"),
      value: languageLabelMap[language],
      onPress: handleLanguageSelect,
    },
    {
      icon: "log-out-outline",
      label: t("settings.signOut"),
      onPress: handleSignOut,
      destructive: true,
    },
  ];

  return { items };
};
