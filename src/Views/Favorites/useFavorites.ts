import { fetchClubShortlist } from "@/processes/profile";
import { ShortlistedAthlete } from "@/processes/types/profileTypes";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Linking } from "react-native";
import { UseFavoritesReturn } from "./Favorites.types";

export function useFavorites(): UseFavoritesReturn {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { user } = useAuthStore();

  const clubUserId = user?.id ?? "";

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["club-shortlist", clubUserId, query],
    queryFn: () => fetchClubShortlist(clubUserId, query),
    enabled: !!clubUserId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const handleContact = useCallback((phone: string | null) => {
    if (!phone) return;
    const cleaned = phone.replace(/\D/g, "");
    Linking.openURL(`tel:${cleaned}`);
  }, []);

  const handleViewProfile = useCallback(
    (athlete: ShortlistedAthlete) => {
      router.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `/visitor-profile?userId=${athlete.id}&username=${encodeURIComponent(athlete.username ?? "")}&name=${encodeURIComponent(athlete.name)}` as any
      );
    },
    [router]
  );

  return {
    query,
    setQuery,
    athletes: data ?? [],
    isLoading,
    isError,
    refetch,
    handleContact,
    handleViewProfile,
  };
}
