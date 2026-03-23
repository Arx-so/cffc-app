export type UseSignupReturn = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  selectedRole: 'athlete' | 'pro' | 'club' | null;
  birthDateText: string;
  guardianEmail: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;

  isMinor: boolean;

  setFullName: (fullName: string) => void;
  setUsername: (username: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setConfirmPassword: (confirmPassword: string) => void;
  setSelectedRole: (role: 'athlete' | 'pro' | 'club') => void;
  onBirthDateChange: (text: string) => void;
  setGuardianEmail: (guardianEmail: string) => void;
  setAcceptedTerms: (value: boolean) => void;
  setAcceptedPrivacy: (value: boolean) => void;
  onSignupPress: () => void;
  onLoginPress: () => void;
  isLoading: boolean;
};
