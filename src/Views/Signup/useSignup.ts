import { signup } from "@/processes/auth";
import { ClubHistoryEntry } from "@/processes/types/profileTypes";
import {
  formatBirthDateInput,
  getAgeInYears,
  parseDDMMYYYY,
  toYYYYMMDD,
} from "@/utils/birthDate";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { UseSignupReturn } from "./Signup.types";

type ProfileRole = 'athlete' | 'pro' | 'club';
type AthleteFoot = "right" | "left" | "both";
type AthleteContactVisibility = "clubs_agents" | "public";

// Auto-format input as Brazilian phone while restricting to digits.
const formatPhonePtBrInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const useSignup = (): UseSignupReturn => {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<ProfileRole | null>(null);
  const [birthDateText, setBirthDateText] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");
  const [athleteHeight, setAthleteHeight] = useState("");
  const [athleteWeight, setAthleteWeight] = useState("");
  const [athleteDominantFoot, setAthleteDominantFoot] =
    useState<AthleteFoot | null>(null);
  const [athletePositions, setAthletePositions] = useState<string[]>([]);
  const [athleteStrengths, setAthleteStrengths] = useState<string[]>([]);
  const [athleteCurrentCategory, setAthleteCurrentCategory] = useState("");
  const [athleteAvailability, setAthleteAvailability] = useState("");
  const [athleteIsSearchable, setAthleteIsSearchable] = useState(true);
  const [athleteContactVisibility, setAthleteContactVisibility] =
    useState<AthleteContactVisibility>("clubs_agents");
  const [athleteClubHistory, setAthleteClubHistory] = useState<ClubHistoryEntry[]>(
    []
  );
  const [athleteClubDraft, setAthleteClubDraft] = useState<ClubHistoryEntry>({
    club: "",
    category: "",
    start: "",
    end: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const signupMutation = useMutation({
    mutationFn: (body: {
      name: string;
      username: string;
      email: string;
      password: string;
      role: ProfileRole;
      birthDate: string; // YYYY-MM-DD
      guardianEmail?: string;
      city?: string;
      state?: string;
      phone?: string;
      athleteHeight?: number;
      athleteWeight?: number;
      athleteDominantFoot?: AthleteFoot;
      athletePositions?: string[];
      athleteStrengths?: string[];
      athleteCurrentCategory?: string;
      athleteAvailability?: string;
      athleteClubHistory?: ClubHistoryEntry[];
      athleteIsSearchable?: boolean;
      athleteContactVisibility?: AthleteContactVisibility;
    }) => signup(body),
    onSuccess: () => {
      router.replace('/login');
      Toast.show({
        type: 'success',
        text1: t("signup.toasts.accountCreated"),
        text2: t("signup.toasts.confirmEmail"),
        visibilityTime: 6000,
        autoHide: true,
      });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : t("signup.toasts.createError");

      const isConfirmationEmailError = message
        .toLowerCase()
        .includes("error sending confirmation email");

      Toast.show({
        type: "error",
        text1: isConfirmationEmailError
          ? t("signup.toasts.confirmationEmailError")
          : t("signup.toasts.createError"),
        text2: isConfirmationEmailError
          ? t("signup.toasts.smtpCheck")
          : undefined,
        autoHide: true,
      });
    },
  });

  // Auto-format input as DD/MM/YYYY while restricting to digits.
  const onBirthDateChange = useCallback((text: string) => {
    setBirthDateText(formatBirthDateInput(text));
  }, []);

  const onPhoneChange = useCallback((text: string) => {
    setPhone(formatPhonePtBrInput(text));
  }, []);

  const parsedBirthDate = useMemo(
    () => parseDDMMYYYY(birthDateText),
    [birthDateText],
  );

  const isMinor = useMemo(() => {
    // Clubs are organizations, not individuals — minor protection only applies
    // to a real person's birth date (athlete/pro).
    if (!parsedBirthDate || selectedRole === "club") return false;
    return getAgeInYears(parsedBirthDate) < 18;
  }, [parsedBirthDate, selectedRole]);

  const onAddAthleteClub = useCallback(() => {
    const trimmedClub = athleteClubDraft.club.trim();
    if (!trimmedClub) return;
    setAthleteClubHistory((prev) => [
      ...prev,
      {
        club: trimmedClub,
        category: athleteClubDraft.category.trim(),
        start: athleteClubDraft.start.trim(),
        end: athleteClubDraft.end.trim(),
      },
    ]);
    setAthleteClubDraft({
      club: "",
      category: "",
      start: "",
      end: "",
    });
  }, [athleteClubDraft]);

  const onRemoveAthleteClub = useCallback((index: number) => {
    setAthleteClubHistory((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const toggleAthletePosition = useCallback((position: string) => {
    setAthletePositions((prev) =>
      prev.includes(position)
        ? prev.filter((item) => item !== position)
        : [...prev, position],
    );
  }, []);

  const toggleAthleteStrength = useCallback((strength: string) => {
    setAthleteStrengths((prev) =>
      prev.includes(strength)
        ? prev.filter((item) => item !== strength)
        : [...prev, strength],
    );
  }, []);

  const onSignupPress = useCallback(async () => {
    if (
      !fullName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword ||
      !city.trim()
    ) {
      Toast.show({ type: "error", text1: t("signup.toasts.requiredFields"), autoHide: true });
      return;
    }

    if (!selectedRole) {
      Toast.show({ type: "error", text1: t("signup.toasts.selectProfileType"), autoHide: true });
      return;
    }

    if (!parsedBirthDate) {
      Toast.show({ type: "error", text1: t("signup.toasts.invalidBirthDate"), autoHide: true });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ type: "error", text1: t("signup.toasts.passwordMismatch"), autoHide: true });
      return;
    }

    if (!acceptedTerms || !acceptedPrivacy) {
      Toast.show({ type: "error", text1: t("signup.toasts.acceptTermsPrivacy"), autoHide: true });
      return;
    }

    const guardianEmailValue = guardianEmail.trim();
    if (isMinor && !guardianEmailValue) {
      Toast.show({ type: "error", text1: t("signup.toasts.guardianEmailRequired"), autoHide: true });
      return;
    }

    try {
      const isAthlete = selectedRole === "athlete";
      await signupMutation.mutateAsync({
        name: fullName.trim(),
        username: username.trim().replace(/^@+/, "").toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
        role: selectedRole,
        birthDate: toYYYYMMDD(parsedBirthDate),
        guardianEmail: isMinor ? guardianEmailValue : undefined,
        city: city.trim() || undefined,
        state: state.trim().toUpperCase() || undefined,
        phone: phone.trim() || undefined,
        athleteHeight:
          isAthlete && athleteHeight.trim()
            ? Number(athleteHeight.trim())
            : undefined,
        athleteWeight:
          isAthlete && athleteWeight.trim()
            ? Number(athleteWeight.trim())
            : undefined,
        athleteDominantFoot: isAthlete ? athleteDominantFoot ?? undefined : undefined,
        athletePositions: isAthlete ? athletePositions : undefined,
        athleteStrengths: isAthlete ? athleteStrengths : undefined,
        athleteCurrentCategory: isAthlete
          ? athleteCurrentCategory.trim() || undefined
          : undefined,
        athleteAvailability: isAthlete
          ? athleteAvailability.trim() || undefined
          : undefined,
        athleteClubHistory: isAthlete ? athleteClubHistory : undefined,
        athleteIsSearchable: isAthlete ? athleteIsSearchable : undefined,
        athleteContactVisibility: isAthlete
          ? athleteContactVisibility
          : undefined,
      });
    } catch {
      // Error feedback is handled centrally in mutation onError.
    }
  }, [
    acceptedPrivacy,
    acceptedTerms,
    confirmPassword,
    email,
    fullName,
    city,
    state,
    phone,
    athleteAvailability,
    athleteClubHistory,
    athleteContactVisibility,
    athleteCurrentCategory,
    athleteDominantFoot,
    athleteHeight,
    athleteIsSearchable,
    athletePositions,
    athleteStrengths,
    athleteWeight,
    guardianEmail,
    isMinor,
    parsedBirthDate,
    password,
    selectedRole,
    signupMutation,
    t,
    username,
  ]);

  const onLoginPress = useCallback(() => {
    router.push("/login");
  }, []);

  return {
    fullName,
    username,
    email,
    password,
    confirmPassword,
    selectedRole,
    birthDateText,
    guardianEmail,
    city,
    state,
    phone,
    athleteHeight,
    athleteWeight,
    athleteDominantFoot,
    athletePositions,
    athleteStrengths,
    athleteCurrentCategory,
    athleteAvailability,
    athleteClubHistory,
    athleteIsSearchable,
    athleteContactVisibility,
    athleteClubDraft,
    acceptedTerms,
    acceptedPrivacy,
    isMinor,
    setFullName,
    setUsername,
    setEmail,
    setPassword,
    setConfirmPassword,
    setSelectedRole,
    onBirthDateChange,
    setGuardianEmail,
    setCity,
    setState,
    onPhoneChange,
    setAthleteHeight,
    setAthleteWeight,
    setAthleteDominantFoot,
    toggleAthletePosition,
    toggleAthleteStrength,
    setAthleteCurrentCategory,
    setAthleteAvailability,
    setAthleteIsSearchable,
    setAthleteContactVisibility,
    setAthleteClubDraft,
    onAddAthleteClub,
    onRemoveAthleteClub,
    setAcceptedTerms,
    setAcceptedPrivacy,
    onSignupPress,
    onLoginPress,
    isLoading: signupMutation.isPending,
  };
};
