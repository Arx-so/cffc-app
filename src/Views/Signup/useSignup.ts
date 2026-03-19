import { signup } from "@/processes/auth";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import Toast from "react-native-toast-message";
import { UseSignupReturn } from "./Signup.types";

type ProfileRole = 'athlete' | 'pro' | 'club';

// Auto-insert slashes so the user sees DD/MM/YYYY while typing digits.
const formatBirthDateInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

// Parse DD/MM/YYYY string into a Date. Returns null when incomplete or invalid.
const parseDDMMYYYY = (text: string): Date | null => {
  if (text.length !== 10) return null;
  const [dd, mm, yyyy] = text.split('/').map(Number);
  if (!dd || !mm || !yyyy) return null;
  const date = new Date(yyyy, mm - 1, dd);
  // Guard against invalid dates like 31/02/2000.
  if (
    date.getDate() !== dd ||
    date.getMonth() !== mm - 1 ||
    date.getFullYear() !== yyyy
  ) return null;
  return date;
};

const getAgeInYears = (date: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age -= 1;
  return age;
};

const toYYYYMMDD = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, '0');
  const dd = `${date.getDate()}`.padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const useSignup = (): UseSignupReturn => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<ProfileRole | null>(null);
  const [birthDateText, setBirthDateText] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const signupMutation = useMutation({
    mutationFn: (body: {
      name: string;
      email: string;
      password: string;
      role: ProfileRole;
      birthDate: string; // YYYY-MM-DD
      guardianEmail?: string;
    }) => signup(body),
    onSuccess: () => {
      router.replace('/login');
      Toast.show({
        type: 'success',
        text1: 'Conta criada com sucesso! 🎉',
        text2: 'Confirme seu e-mail antes de entrar.',
        visibilityTime: 6000,
        autoHide: true,
      });
    },
    onError: () => {
      Toast.show({
        type: "error",
        text1: "Falha ao criar conta. Tente novamente.",
        autoHide: true,
      });
    },
  });

  // Auto-format input as DD/MM/YYYY while restricting to digits.
  const onBirthDateChange = useCallback((text: string) => {
    setBirthDateText(formatBirthDateInput(text));
  }, []);

  const parsedBirthDate = useMemo(
    () => parseDDMMYYYY(birthDateText),
    [birthDateText],
  );

  const isMinor = useMemo(() => {
    if (!parsedBirthDate) return false;
    return getAgeInYears(parsedBirthDate) < 18;
  }, [parsedBirthDate]);

  const onSignupPress = useCallback(async () => {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Toast.show({ type: "error", text1: "Preencha todos os campos obrigatórios.", autoHide: true });
      return;
    }

    if (!selectedRole) {
      Toast.show({ type: "error", text1: "Selecione um tipo de perfil.", autoHide: true });
      return;
    }

    if (!parsedBirthDate) {
      Toast.show({ type: "error", text1: "Data de nascimento inválida. Use DD/MM/AAAA.", autoHide: true });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ type: "error", text1: "As senhas não coincidem.", autoHide: true });
      return;
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      Toast.show({ type: "error", text1: "Aceite os Termos de Uso e a Política de Privacidade.", autoHide: true });
      return;
    }

    const guardianEmailValue = guardianEmail.trim();
    if (isMinor && !guardianEmailValue) {
      Toast.show({ type: "error", text1: "Informe o e-mail do responsável.", autoHide: true });
      return;
    }

    await signupMutation.mutateAsync({
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: selectedRole,
      birthDate: toYYYYMMDD(parsedBirthDate),
      guardianEmail: isMinor ? guardianEmailValue : undefined,
    });
  }, [
    acceptedPrivacy,
    acceptedTerms,
    confirmPassword,
    email,
    fullName,
    guardianEmail,
    isMinor,
    parsedBirthDate,
    password,
    selectedRole,
    signupMutation,
  ]);

  const onLoginPress = useCallback(() => {
    router.push("/login");
  }, []);

  return {
    fullName,
    email,
    password,
    confirmPassword,
    selectedRole,
    birthDateText,
    guardianEmail,
    acceptedTerms,
    acceptedPrivacy,
    isMinor,
    setFullName,
    setEmail,
    setPassword,
    setConfirmPassword,
    setSelectedRole,
    onBirthDateChange,
    setGuardianEmail,
    setAcceptedTerms,
    setAcceptedPrivacy,
    onSignupPress,
    onLoginPress,
    isLoading: signupMutation.isPending,
  };
};
