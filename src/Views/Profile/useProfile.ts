import { fetchUserVideoFeed } from "@/processes/feed";
import {
  fetchAthleteProfile,
  fetchAthleteProfileData,
  fetchProfilePersonalFields,
  fetchProfileVideos,
} from "@/processes/profile";
import { ProfileVideo } from "@/processes/types/profileTypes";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { UseProfileReturn } from "./Profile.types";

const OWN_PROFILE_STALE = 10 * 60 * 1000;
const OWN_PROFILE_GC = 30 * 60 * 1000;

export const useProfile = (): UseProfileReturn => {
  const { user: currentUser, role } = useAuthStore((state) => state);
  const userId = currentUser?.id ?? "";
  const { t } = useTranslation();
  const isAthlete = role === "athlete";

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

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchAthleteProfile(userId),
    enabled: !!userId,
    staleTime: OWN_PROFILE_STALE,
    gcTime: OWN_PROFILE_GC,
  });

  const { data: videosData } = useQuery({
    queryKey: ["profileVideos", userId],
    queryFn: () => fetchProfileVideos(userId),
    enabled: !!userId && isAthlete,
    staleTime: OWN_PROFILE_STALE,
    gcTime: OWN_PROFILE_GC,
  });

  const { data: personalFields, isLoading: personalLoading } = useQuery({
    queryKey: ["profilePersonal", userId],
    queryFn: () => fetchProfilePersonalFields(userId),
    enabled: !!userId && isAthlete,
    staleTime: OWN_PROFILE_STALE,
    gcTime: OWN_PROFILE_GC,
  });

  const { data: athleteProfileRow, isLoading: athleteRowLoading } =
    useQuery({
      queryKey: ["athleteProfileEdit", userId],
      queryFn: () => fetchAthleteProfileData(userId),
      enabled: !!userId && isAthlete,
      staleTime: OWN_PROFILE_STALE,
      gcTime: OWN_PROFILE_GC,
    });

  useQuery({
    queryKey: ["user-feed-videos", userId],
    queryFn: () => fetchUserVideoFeed(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const videos = videosData ?? [];

  const profileDataWithVideoCount = profileData
    ? {
        ...profileData,
        stats: { ...profileData.stats, videoCount: videos.length },
      }
    : null;

  const handleVideoPress = useCallback(
    (item: ProfileVideo) => {
      const index = videos.findIndex((v) => v.id === item.id);
      router.push(
        `/user-feed?userId=${userId}&username=${encodeURIComponent(profileData?.username ?? "")}&initialIndex=${Math.max(index, 0)}` as any
      );
    },
    [videos, userId, profileData?.username]
  );

  const athleteOwnProfileExtra =
    isAthlete
      ? {
          isLoading: personalLoading || athleteRowLoading,
          birthDate: personalFields?.birth_date ?? null,
          phone: personalFields?.phone ?? null,
          athleteProfile: athleteProfileRow ?? null,
        }
      : null;

  return {
    profileData: profileDataWithVideoCount,
    videos,
    isLoading: isProfileLoading,
    isError: isProfileError,
    handleAddVideoPress,
    handleVideoPress,
    athleteOwnProfileExtra,
  };
};
