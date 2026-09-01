import { signInWithApple } from '@/processes/auth';
import { useAuthStore } from '@/stores/authStore';
import { useCallback, useState } from 'react';
import Toast from 'react-native-toast-message';

export const useAppleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const signIn = useAuthStore((state) => state.signIn);

  const onAppleSignIn = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await signInWithApple();
      // result is null when the user cancelled the Apple sheet — no error toast needed.
      if (result) await signIn(result.user);
    } catch (error) {
      console.error('[Apple Auth] error:', error);
      Toast.show({ type: 'error', text1: 'Falha no login com Apple. Tente novamente.', autoHide: true });
    } finally {
      setIsLoading(false);
    }
  }, [signIn]);

  return { onAppleSignIn, isLoading };
};
