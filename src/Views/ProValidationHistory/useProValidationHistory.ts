import { fetchValidatedAthletes } from "@/processes/validation";
import { ValidatedAthleteResult } from "@/processes/types/profileTypes";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { UseProValidationHistoryReturn } from "./ProValidationHistory.types";

export function useProValidationHistory(): UseProValidationHistoryReturn {
  const router = useRouter();
  const proUserId = useAuthStore((state) => state.user?.id);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["validated-athletes", proUserId],
    queryFn: () => fetchValidatedAthletes(proUserId!),
    enabled: !!proUserId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const handleViewProfile = useCallback(
    (athlete: ValidatedAthleteResult) => {
      router.push(
        `/visitor-profile?userId=${athlete.id}&username=${encodeURIComponent(athlete.username ?? "")}&name=${encodeURIComponent(athlete.name)}` as any
      );
    },
    [router]
  );

  return {
    athletes: data ?? [],
    isLoading,
    isError,
    refetch,
    handleViewProfile,
  };
}
