import { LegalUrls } from "@/constants/legal";
import { deleteAccount } from "@/processes/auth";
import { useAuthStore } from "@/stores/authStore";
import { Language, useLanguageStore } from "@/stores/languageStore";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { SettingItem, UseSettingsReturn } from "./Settings.types";

export const useSettings = (): UseSettingsReturn => {
  const { t } = useTranslation();
  const signOut = useAuthStore((state) => state.signOut);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isLanguageSheetOpen, setIsLanguageSheetOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const languageLabelMap: Record<Language, string> = {
    en: t("settings.langEn"),
    ja: t("settings.langJa"),
    "pt-BR": t("settings.langPtBr"),
  };

  const handleSignOut = useCallback(async() => {
    await signOut();

    router.replace("/login")
  }, [signOut]);

  const openLanguageSheet = useCallback(() => {
    setIsLanguageSheetOpen(true);
  }, []);

  const closeLanguageSheet = useCallback(() => {
    setIsLanguageSheetOpen(false);
  }, []);

  const languageOptions = (["en", "pt-BR", "ja"] as const).map((key) => ({
    key,
    label: languageLabelMap[key],
    selected: key === language,
  }));

  const selectLanguage = useCallback(
    (key: string) => {
      setLanguage(key as Language);
      setIsLanguageSheetOpen(false);
    },
    [setLanguage],
  );

  const openDeleteConfirm = useCallback(() => {
    setIsDeleteConfirmOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setIsDeleteConfirmOpen(false);
  }, []);

  const confirmDeleteAccount = useCallback(async () => {
    setIsDeletingAccount(true);
    try {
      await deleteAccount();
      await signOut();
      router.replace("/login");
    } catch {
      Toast.show({ type: "error", text1: t("settings.deleteAccountError") });
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteConfirmOpen(false);
    }
  }, [signOut, t]);

  const items: SettingItem[] = [
    {
      icon: "globe-2-outline",
      label: t("settings.language"),
      value: languageLabelMap[language],
      onPress: openLanguageSheet,
    },
    {
      icon: "shield-outline",
      label: t("signup.privacyPolicy"),
      onPress: () => WebBrowser.openBrowserAsync(LegalUrls.privacyPolicy),
    },
    {
      icon: "file-text-outline",
      label: t("signup.termsOfUse"),
      onPress: () => WebBrowser.openBrowserAsync(LegalUrls.termsOfUse),
    },
    {
      icon: "question-mark-circle-outline",
      label: t("settings.support"),
      onPress: () => WebBrowser.openBrowserAsync(LegalUrls.support),
    },
    {
      icon: "log-out-outline",
      label: t("settings.signOut"),
      onPress: handleSignOut,
      destructive: true,
    },
    {
      icon: "trash-2-outline",
      label: isDeletingAccount
        ? t("settings.deleteAccountInProgress")
        : t("settings.deleteAccount"),
      onPress: isDeletingAccount ? () => {} : openDeleteConfirm,
      destructive: true,
    },
  ];

  return {
    items,
    isLanguageSheetOpen,
    languageSheetTitle: t("settings.language"),
    languageOptions,
    closeLanguageSheet,
    selectLanguage,
    isDeleteConfirmOpen,
    isDeletingAccount,
    deleteConfirmTitle: t("settings.deleteAccountConfirmTitle"),
    deleteConfirmMessage: t("settings.deleteAccountConfirmMessage"),
    deleteConfirmCancelLabel: t("common.cancel"),
    deleteConfirmButtonLabel: t("settings.deleteAccountConfirmButton"),
    closeDeleteConfirm,
    confirmDeleteAccount,
    languageSheetCancelLabel: t("common.cancel"),
  };
};
