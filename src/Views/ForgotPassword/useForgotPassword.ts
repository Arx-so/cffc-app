import { requestPasswordReset } from "@/processes/auth";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { UseForgotPasswordReturn } from "./ForgotPassword.types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useForgotPassword = (): UseForgotPasswordReturn => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const resetMutation = useMutation({
    mutationFn: (value: string) => requestPasswordReset(value),
    onSuccess: () => {
      setEmailSent(true);
    },
    onError: (error) => {
      console.error("Password reset error:", error);

      const message =
        error instanceof Error
          ? error.message
          : t("forgotPassword.toasts.requestFailed");

      Toast.show({ type: "error", text1: message, autoHide: true });
    },
  });

  const submit = useCallback(() => {
    const normalized = email.trim().toLowerCase();

    if (!normalized) {
      Toast.show({
        type: "error",
        text1: t("forgotPassword.toasts.missingEmail"),
        autoHide: true,
      });
      return;
    }

    if (!EMAIL_REGEX.test(normalized)) {
      Toast.show({
        type: "error",
        text1: t("forgotPassword.toasts.invalidEmail"),
        autoHide: true,
      });
      return;
    }

    resetMutation.mutate(normalized);
  }, [email, resetMutation, t]);

  const onResendPress = useCallback(() => {
    Toast.show({
      type: "success",
      text1: t("forgotPassword.toasts.emailResent"),
      autoHide: true,
    });
    submit();
  }, [submit, t]);

  const onBackToLoginPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/login");
  }, []);

  return {
    email,
    setEmail,
    emailSent,
    onSubmitPress: submit,
    onResendPress,
    onBackToLoginPress,
    isLoading: resetMutation.isPending,
  };
};
