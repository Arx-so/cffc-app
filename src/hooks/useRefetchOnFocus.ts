import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

/**
 * Invalidates the given query keys every time the screen comes into focus.
 * Use this in any `use<View>.ts` hook to ensure fresh data on tab/screen switches.
 *
 * @example
 * useRefetchOnFocus(["profile", userId], ["profileVideos", userId]);
 */
export const useRefetchOnFocus = (...queryKeys: unknown[][]) => {
  const queryClient = useQueryClient();

  useFocusEffect(
    useCallback(() => {
      queryKeys.forEach((key) => {
        // resetQueries clears cached data before refetching, so isLoading becomes
        // true and the screen shows a proper loading state on every focus.
        queryClient.resetQueries({ queryKey: key });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryClient, JSON.stringify(queryKeys)])
  );
};
