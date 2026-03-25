import { fetchUserVideoFeed } from "@/processes/feed";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList } from "react-native";
import { FeedVideo } from "@/processes/types/feedTypes";
import {
  UseUserFeedProps,
  UseUserFeedReturn,
  UserFeedViewabilityChange,
} from "./UserFeed.types";

export const useUserFeed = ({
  userId,
  initialIndex,
}: UseUserFeedProps): UseUserFeedReturn => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const listRef = useRef<FlatList<FeedVideo>>(null);
  const hasScrolledToInitial = useRef(false);

  const feedQuery = useQuery({
    queryKey: ["user-feed-videos", userId],
    queryFn: () => fetchUserVideoFeed(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const onViewableItemsChanged = useRef((info: UserFeedViewabilityChange) => {
    const visibleIndex = info.viewableItems[0]?.index ?? 0;
    setActiveIndex(visibleIndex);
  }).current;

  useEffect(() => {
    if (
      hasScrolledToInitial.current ||
      !feedQuery.data?.length ||
      initialIndex === 0
    )
      return;
    const timeout = setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: Math.min(initialIndex, feedQuery.data.length - 1),
        animated: false,
      });
      setActiveIndex(Math.min(initialIndex, feedQuery.data.length - 1));
      hasScrolledToInitial.current = true;
    }, 100);
    return () => clearTimeout(timeout);
  }, [feedQuery.data, initialIndex]);

  const handleRetry = useCallback(() => {
    void feedQuery.refetch();
  }, [feedQuery]);

  const handleRefresh = useCallback(() => {
    void feedQuery.refetch();
  }, [feedQuery]);

  return {
    videos: feedQuery.data ?? [],
    isLoading: feedQuery.isLoading,
    isRefetching: feedQuery.isRefetching,
    hasError: feedQuery.isError,
    activeIndex,
    listRef,
    handleRetry,
    handleRefresh,
    onViewableItemsChanged,
    viewabilityConfig,
  };
};
