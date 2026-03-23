import {
  fetchAthleteProfile,
  fetchProfileVideos,
} from "@/processes/profile";
import { useRefetchOnFocus } from "@/hooks/useRefetchOnFocus";
import { UserRole } from "@/processes/types/profileTypes";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { UseProfileReturn } from "./Profile.types";

export const useProfile = (userId?: string): UseProfileReturn => {
  const currentUser = useAuthStore((state) => state.user);
  const targetUserId = userId ?? currentUser?.id ?? "";
  const { t } = useTranslation();

  const isOwnProfile = targetUserId === currentUser?.id;

  const handleAddVideoPress = useCallback(async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Toast.show({ type: "error", text1: t("editProfile.permissionRequired") });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) return;

    router.push(`/add-video?videoUri=${encodeURIComponent(result.assets[0].uri)}`);
  }, [t]);

  useRefetchOnFocus(
    ["profile", targetUserId],
    ["profileVideos", targetUserId]
  );

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["profile", targetUserId],
    queryFn: () => fetchAthleteProfile(targetUserId),
    enabled: !!targetUserId,
  });

  const { data: videosData } = useQuery({
    queryKey: ["profileVideos", targetUserId],
    queryFn: () => fetchProfileVideos(targetUserId),
    enabled: !!targetUserId,
  });

  const viewerRole = useMemo<UserRole>(() => {
    if (isOwnProfile && profileData) return profileData.role;
    // TODO: fetch current user's role separately for visitor view
    return "athlete";
  }, [isOwnProfile, profileData]);

  const videos = videosData ?? [];

  const profileDataWithVideoCount = profileData
    ? {
        ...profileData,
        stats: { ...profileData.stats, videoCount: videos.length },
      }
    : null;

  return {
    profileData: profileDataWithVideoCount,
    videos,
    isOwnProfile,
    viewerRole,
    isLoading: isProfileLoading,
    isError: isProfileError,
    handleAddVideoPress,
  };
};
