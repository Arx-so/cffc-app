import { login } from "@/processes/auth";
import { useAuthStore } from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { UseLoginReturn } from "./Login.types";

export const useLogin = (): UseLoginReturn => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signIn = useAuthStore((state) => state.signIn);

  const loginMutation = useMutation({
    mutationFn: (body: { email: string; password: string }) => login(body),
    onSuccess: (data) => {
      signIn(data.user);
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: "Login failed. Please try again.",
        autoHide: true,
      });
    },
  });

  const onLoginPress = useCallback(async () => {
    if (!email.trim() || !password) {
      Toast.show({
        type: "error",
        text1: "Please enter your email and password.",
        autoHide: true,
      });
      return;
    }
    await loginMutation.mutateAsync({ email: email.trim(), password });
  }, [email, password, loginMutation]);

  return {
    email,
    password,
    setEmail,
    setPassword,
    onLoginPress,
    isLoading: loginMutation.isPending,
  };
};
