import { FeedVideo } from "@/processes/types/feedTypes";
import { ViewToken } from "react-native";

export interface HomeFeedViewabilityChange {
  viewableItems: Array<ViewToken<FeedVideo>>;
}

export interface UseHomeFeedReturn {
  videos: FeedVideo[];
  isLoading: boolean;
  isRefetching: boolean;
  hasError: boolean;
  activeIndex: number;
  handleRetry: () => void;
  handleRefresh: () => void;
  onViewableItemsChanged: (info: HomeFeedViewabilityChange) => void;
  viewabilityConfig: {
    itemVisiblePercentThreshold: number;
  };
}
