import {
  fetchAthleteProfileData,
  fetchProfileForEdit,
  updateProfile,
  uploadAvatar,
  upsertAthleteProfile,
} from "@/processes/profile";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import {
  AthleteFormState,
  ProfileFormState,
  UseEditProfileReturn,
} from "./EditProfile.types";

const INITIAL_PROFILE: ProfileFormState = {
  name: "",
  username: "",
  city: "",
  state: "",
  birthDate: "",
  phone: "",
  avatarUrl: null,
};

const INITIAL_ATHLETE: AthleteFormState = {
  height: "",
  weight: "",
  dominantFoot: null,
  positions: [],
  strengths: [],
  currentCategory: "",
  availability: "",
  clubHistory: [],
  isSearchable: true,
  contactVisibility: "clubs_agents",
};

export const useEditProfile = (): UseEditProfileReturn => {
  const currentUser = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const userId = currentUser?.id ?? "";
  const isAthlete = role === "athlete";
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [profileForm, setProfileForm] =
    useState<ProfileFormState>(INITIAL_PROFILE);
  const [athleteForm, setAthleteForm] =
    useState<AthleteFormState>(INITIAL_ATHLETE);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const originalProfileRef = useRef<ProfileFormState>(INITIAL_PROFILE);
  const originalAthleteRef = useRef<AthleteFormState>(INITIAL_ATHLETE);
  const isSavedRef = useRef(false);
  const navigation = useNavigation();

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profileEdit", userId],
    queryFn: () => fetchProfileForEdit(userId),
    enabled: !!userId,
  });

  const { data: athleteData, isLoading: athleteLoading } = useQuery({
    queryKey: ["athleteProfileEdit", userId],
    queryFn: () => fetchAthleteProfileData(userId),
    enabled: !!userId && isAthlete,
  });

  useEffect(() => {
    if (!profileData) return;
    const snapshot: ProfileFormState = {
      name: profileData.name ?? "",
      username: profileData.username ?? "",
      city: profileData.city ?? "",
      state: profileData.state ?? "",
      birthDate: profileData.birth_date ?? "",
      phone: profileData.phone ?? "",
      avatarUrl: profileData.avatar_url,
    };
    setProfileForm(snapshot);
    originalProfileRef.current = snapshot;
  }, [profileData]);

  useEffect(() => {
    if (!athleteData) return;
    const snapshot: AthleteFormState = {
      height: athleteData.height?.toString() ?? "",
      weight: athleteData.weight?.toString() ?? "",
      dominantFoot: athleteData.dominant_foot,
      positions: [...athleteData.positions],
      strengths: [...athleteData.strengths],
      currentCategory: athleteData.current_category ?? "",
      availability: athleteData.availability ?? "",
      clubHistory: [...athleteData.club_history],
      isSearchable: athleteData.is_searchable,
      contactVisibility: athleteData.contact_visibility ?? "clubs_agents",
    };
    setAthleteForm(snapshot);
    originalAthleteRef.current = snapshot;
  }, [athleteData]);

  const setProfileField = useCallback(
    <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
      setProfileForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const setAthleteField = useCallback(
    <K extends keyof AthleteFormState>(key: K, value: AthleteFormState[K]) => {
      setAthleteForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handlePickAvatar = useCallback(async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Toast.show({ type: "error", text1: t("editProfile.permissionRequired") });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setIsUploadingAvatar(true);
    try {
      const url = await uploadAvatar(userId, result.assets[0].uri);
      setProfileForm((prev) => ({ ...prev, avatarUrl: url }));
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    } catch {
      Toast.show({ type: "error", text1: t("editProfile.uploadError") });
      setIsUploadingAvatar(false);
    }
  }, [userId, queryClient, t]);

  const onAvatarLoaded = useCallback(() => {
    setIsUploadingAvatar(false);
  }, []);

  const handleAddPosition = useCallback(
    (position: string) => {
      const trimmed = position.trim();
      if (!trimmed) return;
      setAthleteForm((prev) => {
        if (prev.positions.includes(trimmed)) return prev;
        return { ...prev, positions: [...prev.positions, trimmed] };
      });
    },
    []
  );

  const handleRemovePosition = useCallback((position: string) => {
    setAthleteForm((prev) => ({
      ...prev,
      positions: prev.positions.filter((p) => p !== position),
    }));
  }, []);

  const handleAddStrength = useCallback(
    (strength: string) => {
      const trimmed = strength.trim();
      if (!trimmed) return;
      setAthleteForm((prev) => {
        if (prev.strengths.includes(trimmed)) return prev;
        return { ...prev, strengths: [...prev.strengths, trimmed] };
      });
    },
    []
  );

  const handleRemoveStrength = useCallback((strength: string) => {
    setAthleteForm((prev) => ({
      ...prev,
      strengths: prev.strengths.filter((s) => s !== strength),
    }));
  }, []);

  const handleAddClub = useCallback(
    (entry: import("@/processes/types/profileTypes").ClubHistoryEntry) => {
      if (!entry.club.trim()) return;
      setAthleteForm((prev) => ({
        ...prev,
        clubHistory: [...prev.clubHistory, entry],
      }));
    },
    []
  );

  const handleRemoveClub = useCallback((index: number) => {
    setAthleteForm((prev) => ({
      ...prev,
      clubHistory: prev.clubHistory.filter((_, i) => i !== index),
    }));
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await updateProfile(userId, {
        name: profileForm.name || null,
        username: profileForm.username || null,
        city: profileForm.city || null,
        state: profileForm.state || null,
        birth_date: profileForm.birthDate || null,
        phone: profileForm.phone || null,
      });

      if (isAthlete) {
        await upsertAthleteProfile(userId, {
          height: athleteForm.height ? Number(athleteForm.height) : null,
          weight: athleteForm.weight ? Number(athleteForm.weight) : null,
          dominant_foot: athleteForm.dominantFoot,
          positions: athleteForm.positions,
          strengths: athleteForm.strengths,
          current_category: athleteForm.currentCategory || null,
          availability: athleteForm.availability || null,
          club_history: athleteForm.clubHistory,
          is_searchable: athleteForm.isSearchable,
          contact_visibility: athleteForm.contactVisibility || null,
        });
      }
    },
    onSuccess: () => {
      isSavedRef.current = true;
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["profileEdit", userId] });
      queryClient.invalidateQueries({
        queryKey: ["athleteProfileEdit", userId],
      });
      Toast.show({ type: "success", text1: t("editProfile.profileUpdated") });
      router.back();
    },
    onError: () => {
      Toast.show({ type: "error", text1: t("editProfile.saveError") });
    },
  });

  const handleSave = useCallback(async () => {
    await saveMutation.mutateAsync();
  }, [saveMutation]);

  const hasUnsavedChanges = useCallback((): boolean => {
    const orig = originalProfileRef.current;
    const profileDirty =
      profileForm.name !== orig.name ||
      profileForm.username !== orig.username ||
      profileForm.city !== orig.city ||
      profileForm.state !== orig.state ||
      profileForm.birthDate !== orig.birthDate ||
      profileForm.phone !== orig.phone ||
      profileForm.avatarUrl !== orig.avatarUrl;

    if (profileDirty) return true;

    if (isAthlete) {
      const origA = originalAthleteRef.current;
      const athleteDirty =
        athleteForm.height !== origA.height ||
        athleteForm.weight !== origA.weight ||
        athleteForm.dominantFoot !== origA.dominantFoot ||
        athleteForm.currentCategory !== origA.currentCategory ||
        athleteForm.availability !== origA.availability ||
        athleteForm.isSearchable !== origA.isSearchable ||
        athleteForm.contactVisibility !== origA.contactVisibility ||
        JSON.stringify(athleteForm.positions) !==
          JSON.stringify(origA.positions) ||
        JSON.stringify(athleteForm.strengths) !==
          JSON.stringify(origA.strengths) ||
        JSON.stringify(athleteForm.clubHistory) !==
          JSON.stringify(origA.clubHistory);

      if (athleteDirty) return true;
    }

    return false;
  }, [profileForm, athleteForm, isAthlete]);

  const handleClose = useCallback(() => {
    router.back();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (isSavedRef.current) return;
      if (!hasUnsavedChanges()) return;

      e.preventDefault();

      Alert.alert(
        t("editProfile.discardTitle"),
        t("editProfile.discardMessage"),
        [
          { text: t("editProfile.discardCancel"), style: "cancel" },
          {
            text: t("editProfile.discardConfirm"),
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges, t]);

  const isDirty = hasUnsavedChanges();

  return {
    profileForm,
    athleteForm: isAthlete ? athleteForm : null,
    isAthlete,
    isLoading: profileLoading || (isAthlete && athleteLoading),
    isSaving: saveMutation.isPending,
    isUploadingAvatar,
    isDirty,
    setProfileField,
    setAthleteField,
    handlePickAvatar,
    onAvatarLoaded,
    handleAddPosition,
    handleRemovePosition,
    handleAddStrength,
    handleRemoveStrength,
    handleAddClub,
    handleRemoveClub,
    handleSave,
    handleClose,
  };
};
