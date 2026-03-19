import { signInWithGoogle } from '@/processes/auth';
import { useAuthStore } from '@/stores/authStore';
import { useCallback, useState } from 'react';
import Toast from 'react-native-toast-message';

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const signIn = useAuthStore((state) => state.signIn);

  const onGoogleSignIn = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      // result is null when the user cancelled the browser session — no error toast needed.
      if (result) signIn(result.user);
    } catch (error) {
      console.error('[Google Auth] error:', error);
      Toast.show({ type: 'error', text1: 'Falha no login com Google. Tente novamente.', autoHide: true });
    } finally {
      setIsLoading(false);
    }
  }, [signIn]);

  return { onGoogleSignIn, isLoading };
};
