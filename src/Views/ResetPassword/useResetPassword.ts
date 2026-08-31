import {
  hasActiveAuthSession,
  hasPasswordRecoveryParams,
  startPasswordRecoverySession,
  updatePassword,
} from "@/processes/auth";
import { useAuthStore } from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import {
  ResetPasswordStatus,
  UseResetPasswordReturn,
} from "./ResetPassword.types";

const MIN_PASSWORD_LENGTH = 6;

// `Linking.useURL()` reports null until the initial URL resolves, so wait a beat
// before deciding the screen was opened without a recovery link.
const LINK_RESOLUTION_GRACE_MS = 1200;

export const useResetPassword = (): UseResetPasswordReturn => {
  const { t } = useTranslation();
  const url = Linking.useURL();
  const signOut = useAuthStore((state) => state.signOut);

  const [status, setStatus] = useState<ResetPasswordStatus>("validating");
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Each recovery token is single-use, so never feed the same URL to Supabase twice.
  const handledUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!url || handledUrlRef.current === url) return;
    if (!hasPasswordRecoveryParams(url)) return;

    handledUrlRef.current = url;
    let cancelled = false;

    startPasswordRecoverySession(url)
      .then(() => {
        if (cancelled) return;
        setErrorMessage("");
        setStatus("ready");
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Recovery link error:", error);
        setErrorMessage(
          error instanceof Error && error.message !== "MISSING_RECOVERY_TOKEN"
            ? error.message
            : "",
        );
        setStatus("invalid");
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      if (cancelled || handledUrlRef.current) return;

      // The link may have been consumed on an earlier mount; an active recovery
      // session is enough on its own to let the user set a new password.
      const active = await hasActiveAuthSession();
      if (cancelled || handledUrlRef.current) return;

      setStatus(active ? "ready" : "invalid");
    }, LINK_RESOLUTION_GRACE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const updateMutation = useMutation({
    mutationFn: (value: string) => updatePassword(value),
    onSuccess: async () => {
      // Drop the recovery session (store included, so the route guard does not
      // bounce back into the app) and make the user sign in with the new password.
      await signOut();

      Toast.show({
        type: "success",
        text1: t("resetPassword.toasts.passwordUpdated"),
        autoHide: true,
      });

      router.replace("/login");
    },
    onError: (error) => {
      console.error("Update password error:", error);

      const message =
        error instanceof Error
          ? error.message
          : t("resetPassword.toasts.updateFailed");

      Toast.show({ type: "error", text1: message, autoHide: true });
    },
  });

  const onSubmitPress = useCallback(() => {
    if (!password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: t("resetPassword.toasts.requiredFields"),
        autoHide: true,
      });
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      Toast.show({
        type: "error",
        text1: t("resetPassword.toasts.passwordTooShort", {
          min: MIN_PASSWORD_LENGTH,
        }),
        autoHide: true,
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: t("resetPassword.toasts.passwordMismatch"),
        autoHide: true,
      });
      return;
    }

    updateMutation.mutate(password);
  }, [password, confirmPassword, updateMutation, t]);

  const onRequestNewLinkPress = useCallback(() => {
    router.replace("/forgot-password");
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return {
    status,
    errorMessage,
    password,
    confirmPassword,
    setPassword,
    setConfirmPassword,
    showPassword,
    toggleShowPassword,
    onSubmitPress,
    onRequestNewLinkPress,
    isLoading: updateMutation.isPending,
  };
};
