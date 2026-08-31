// `validating` — resolving the deep link into a session.
// `ready`      — recovery session is active, the new password can be set.
// `invalid`    — no usable link (expired, already used, or opened directly).
export type ResetPasswordStatus = "validating" | "ready" | "invalid";

export type UseResetPasswordReturn = {
  status: ResetPasswordStatus;
  errorMessage: string;
  password: string;
  confirmPassword: string;
  setPassword: (password: string) => void;
  setConfirmPassword: (password: string) => void;
  showPassword: boolean;
  toggleShowPassword: () => void;
  onSubmitPress: () => void;
  onRequestNewLinkPress: () => void;
  isLoading: boolean;
};
