import { router } from "expo-router";
import { useCallback } from "react";
import { UseWelcomeReturn } from "./Welcome.types";

export const useWelcome = (): UseWelcomeReturn => {
  const onLoginPress = useCallback(() => {
    router.push("/login");
  }, []);

  const onSignupPress = useCallback(() => {
    router.push("/signup");
  }, []);

  return { onLoginPress, onSignupPress };
};
