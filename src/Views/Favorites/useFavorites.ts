import { fetchClubShortlist } from "@/processes/profile";
import { ShortlistedAthlete } from "@/processes/types/profileTypes";
import { useAuthStore } from "@/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import { useFocusEffect, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useCallback, useState } from "react";
import { Linking, Platform, Share } from "react-native";
import Toast from "react-native-toast-message";
import { UseFavoritesReturn } from "./Favorites.types";

export function useFavorites(): UseFavoritesReturn {
  const { t } = useTranslation();
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

  const handleContact = useCallback(
    async (phone: string | null) => {
      if (!phone) return;

      const cleaned = phone.replace(/\D/g, "");
      if (!cleaned) {
        Toast.show({ type: "error", text1: t("favorites.contactUnavailable") });
        return;
      }

      const text = `${t("favorites.contactShareText")}\n${cleaned}`;
      const phoneUrl = `tel:${cleaned}`;

      try {
        if (Platform.OS === "android") {
          await Share.share({ message: text, title: t("favorites.contactOptions.title") });
          return;
        }

        await Share.share({
          message: text,
          url: phoneUrl,
        });
      } catch {
        try {
          const canCall = await Linking.canOpenURL(phoneUrl);
          if (canCall) {
            await Linking.openURL(phoneUrl);
            return;
          }
        } catch {
          // Fall through to toast error.
        }
        Toast.show({
          type: "error",
          text1: t("favorites.contactOpenError"),
        });
      }
    },
    [t]
  );

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
