import { signup } from "@/processes/auth";
import { useAuthStore } from "@/stores/authStore";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { UseSignupReturn } from "./Signup.types";

export const useSignup = (): UseSignupReturn => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const signIn = useAuthStore((state) => state.signIn);

  const signupMutation = useMutation({
    mutationFn: (body: { name: string; email: string; password: string }) =>
      signup(body),
    onSuccess: (data) => {
      signIn(data.user);
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: "Signup failed. Please try again.",
        autoHide: true,
      });
    },
  });

  const onSignupPress = useCallback(async () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Please fill in all fields.",
        autoHide: true,
      });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match.",
        autoHide: true,
      });
      return;
    }
    await signupMutation.mutateAsync({
      name: name.trim(),
      email: email.trim(),
      password,
    });
  }, [name, email, password, confirmPassword, signupMutation]);

  const onLoginPress = useCallback(() => {
    router.push("/login");
  }, []);

  return {
    name,
    email,
    password,
    confirmPassword,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    onSignupPress,
    onLoginPress,
    isLoading: signupMutation.isPending,
  };
};
