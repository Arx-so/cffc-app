export type UseForgotPasswordReturn = {
  email: string;
  setEmail: (email: string) => void;
  emailSent: boolean;
  onSubmitPress: () => void;
  onResendPress: () => void;
  onBackToLoginPress: () => void;
  isLoading: boolean;
};
