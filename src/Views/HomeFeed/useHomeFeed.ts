import { fetchVideoFeed } from "@/processes/feed";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import {
  HomeFeedViewabilityChange,
  UseHomeFeedReturn,
} from "./HomeFeed.types";

export const useHomeFeed = (): UseHomeFeedReturn => {
  const [activeIndex, setActiveIndex] = useState(0);

  const feedQuery = useQuery({
    queryKey: ["home-feed-videos"],
    queryFn: fetchVideoFeed,
  });

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const onViewableItemsChanged = useRef((info: HomeFeedViewabilityChange) => {
    const visibleIndex = info.viewableItems[0]?.index ?? 0;
    setActiveIndex(visibleIndex);
  }).current;

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
    handleRetry,
    handleRefresh,
    onViewableItemsChanged,
    viewabilityConfig,
  };
};
