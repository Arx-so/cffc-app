import {
  fetchAthleteProfile,
  fetchProfileVideos,
} from "@/processes/profile";
import { UserRole } from "@/processes/types/profileTypes";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { UseProfileReturn } from "./Profile.types";

export const useProfile = (userId?: string): UseProfileReturn => {
  const currentUser = useAuthStore((state) => state.user);
  const targetUserId = userId ?? currentUser?.id ?? "";

  const isOwnProfile = targetUserId === currentUser?.id;

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

  return {
    profileData: profileData ?? null,
    videos: videosData ?? [],
    isOwnProfile,
    viewerRole,
    isLoading: isProfileLoading,
    isError: isProfileError,
  };
};
