import { login } from "@/processes/auth";
import { useAuthStore } from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { UseLoginReturn } from "./Login.types";

export const useLogin = (): UseLoginReturn => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signIn = useAuthStore((state) => state.signIn);

  const loginMutation = useMutation({
    mutationFn: (body: { email: string; password: string }) => login(body),
    onSuccess: async (data) => {
      await signIn(data.user);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : t("login.toasts.loginFailed");

      // Show the real error message (helps with debugging auth issues).
      console.error('Login error:', error);

      Toast.show({
        type: "error",
        text1: message,
        autoHide: true,
      });
    },
  });

  const onLoginPress = useCallback(async () => {
    if (!email.trim() || !password) {
      Toast.show({
        type: "error",
        text1: t("login.toasts.missingCredentials"),
        autoHide: true,
      });
      return;
    }
    await loginMutation.mutateAsync({
      // Normalize email before sending to Supabase.
      email: email.trim().toLowerCase(),
      password,
    });
  }, [email, password, loginMutation, t]);

  return {
    email,
    password,
    setEmail,
    setPassword,
    onLoginPress,
    isLoading: loginMutation.isPending,
  };
};
