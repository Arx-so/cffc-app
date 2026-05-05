import {
  fetchAthleteProfile,
  fetchAthleteProfileData,
  fetchProfilePersonalFields,
  fetchProfileVideos,
} from "@/processes/profile";
import { fetchUserVideoFeed } from "@/processes/feed";
import { hasExistingValidation } from "@/processes/validation";
import { ProfileVideo } from "@/processes/types/profileTypes";
import { useAuthStore } from "@/stores/authStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { UseVisitorProfileReturn } from "./VisitorProfile.types";

const VISITOR_PROFILE_STALE = 2 * 60 * 1000;
const VISITOR_PROFILE_GC = 5 * 60 * 1000;

export const useVisitorProfile = (
  userId: string,
  username: string | null
): UseVisitorProfileReturn => {
  const queryClient = useQueryClient();
  const proUserId = useAuthStore((state) => state.user?.id);

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ["visitor-profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["visitor-profile-videos", userId] });
      queryClient.invalidateQueries({ queryKey: ["visitor-profile-personal", userId] });
      queryClient.invalidateQueries({ queryKey: ["visitor-athlete-profile-extra", userId] });
    }, [userId, queryClient])
  );

  const {
    data: profileData,
    isLoading: isProfileLoading,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["visitor-profile", userId],
    queryFn: () => fetchAthleteProfile(userId),
    enabled: !!userId,
    staleTime: VISITOR_PROFILE_STALE,
    gcTime: VISITOR_PROFILE_GC,
  });

  const viewingAthlete = profileData?.role === "athlete";

  const { data: visitorPersonalFields, isLoading: visitorPersonalLoading } =
    useQuery({
      queryKey: ["visitor-profile-personal", userId],
      queryFn: () => fetchProfilePersonalFields(userId),
      enabled: !!userId && viewingAthlete,
      staleTime: VISITOR_PROFILE_STALE,
      gcTime: VISITOR_PROFILE_GC,
    });

  const {
    data: visitorAthleteProfileRow,
    isLoading: visitorAthleteRowLoading,
  } = useQuery({
    queryKey: ["visitor-athlete-profile-extra", userId],
    queryFn: () => fetchAthleteProfileData(userId),
    enabled: !!userId && viewingAthlete,
    staleTime: VISITOR_PROFILE_STALE,
    gcTime: VISITOR_PROFILE_GC,
  });

  const { data: videosData } = useQuery({
    queryKey: ["visitor-profile-videos", userId],
    queryFn: () => fetchProfileVideos(userId),
    enabled: !!userId,
    staleTime: VISITOR_PROFILE_STALE,
    gcTime: VISITOR_PROFILE_GC,
  });

  useQuery({
    queryKey: ["user-feed-videos", userId],
    queryFn: () => fetchUserVideoFeed(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const { data: validationExists = false } = useQuery({
    queryKey: ["validation-exists", userId, proUserId],
    queryFn: () => hasExistingValidation(userId, proUserId!),
    enabled: !!userId && !!proUserId,
    staleTime: 60 * 1000,
  });

  const videos = videosData ?? [];

  const visitorAthleteDetailsExtra = viewingAthlete
    ? {
        isLoading: visitorPersonalLoading || visitorAthleteRowLoading,
        birthDate: visitorPersonalFields?.birth_date ?? null,
        phone: visitorPersonalFields?.phone ?? null,
        athleteProfile: visitorAthleteProfileRow ?? null,
      }
    : null;

  const handleVideoPress = useCallback(
    (item: ProfileVideo) => {
      const index = videos.findIndex((v) => v.id === item.id);
      router.push(
        `/user-feed?userId=${userId}&username=${encodeURIComponent(username ?? "")}&initialIndex=${Math.max(index, 0)}` as any
      );
    },
    [videos, userId, username]
  );

  const handleEmitValidation = useCallback(() => {
    const name = encodeURIComponent(profileData?.name ?? "");
    router.push(`/emit-validation?athleteId=${userId}&athleteName=${name}` as any);
  }, [userId, profileData?.name]);

  return {
    profileData: profileData ?? null,
    videos,
    isLoading: isProfileLoading,
    isError: isProfileError,
    hasExistingValidation: validationExists,
    handleVideoPress,
    handleEmitValidation,
    visitorAthleteDetailsExtra,
  };
};
