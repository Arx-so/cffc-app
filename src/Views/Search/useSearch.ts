import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import { addToClubShortlist, searchAthletes } from "@/processes/profile";
import { AthleteSearchResult } from "@/processes/types/profileTypes";
import { useAuthStore } from "@/stores/authStore";
import { useSearchFilterStore } from "@/stores/searchFilterStore";
import { UseSearchReturn } from "./Search.types";

export function useSearch(): UseSearchReturn {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [addingAthleteId, setAddingAthleteId] = useState<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, role } = useAuthStore();
  const store = useSearchFilterStore();
  const filters = {
    positions: store.positions,
    ageMin: store.ageMin,
    ageMax: store.ageMax,
    dominantFoot: store.dominantFoot,
    minHeight: store.minHeight,
    maxWeight: store.maxWeight,
    strengths: store.strengths,
  };

  const clubUserId = role === "club" ? (user?.id ?? undefined) : undefined;
  const viewerProfileId = user?.id ?? null;
  const queryKey = ["search-athletes", query, filters, clubUserId ?? null, viewerProfileId];

  useFocusEffect(
    useCallback(() => {
      setQuery("");
    }, [])
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      searchAthletes(query, filters, clubUserId, viewerProfileId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { mutate: addFavorite } = useMutation({
    mutationFn: (athleteId: string) => addToClubShortlist(athleteId),
    onMutate: (athleteId) => {
      setAddingAthleteId(athleteId);
    },
    onSuccess: (_, athleteId) => {
      queryClient.setQueryData<AthleteSearchResult[]>(queryKey, (prev) =>
        (prev ?? []).map((a) =>
          a.id === athleteId ? { ...a, isShortlisted: true } : a
        )
      );
      setAddingAthleteId(null);
      Toast.show({ type: "success", text1: t("search.favoriteSuccess") });
    },
    onError: () => {
      setAddingAthleteId(null);
      Toast.show({ type: "error", text1: t("search.favoriteError") });
    },
  });

  const openFilter = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push("/search-filter" as any);
  };

  const handleViewProfile = useCallback(
    (athlete: AthleteSearchResult) => {
      router.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        `/visitor-profile?userId=${athlete.id}&username=${encodeURIComponent(athlete.username ?? "")}&name=${encodeURIComponent(athlete.name)}` as any
      );
    },
    [router]
  );

  const handleAddFavorite = useCallback(
    (athleteId: string) => {
      addFavorite(athleteId);
    },
    [addFavorite]
  );

  return {
    query,
    setQuery,
    athletes: data ?? [],
    isLoading,
    isError,
    refetch,
    openFilter,
    hasActiveFilters: store.hasActiveFilters(),
    handleViewProfile,
    handleAddFavorite,
    addingAthleteId,
    role,
  };
}
