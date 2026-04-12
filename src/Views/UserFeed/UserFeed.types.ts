import { FeedVideo } from "@/processes/types/feedTypes";
import { FlatList, ViewToken } from "react-native";

export interface UseUserFeedProps {
  userId: string;
  initialIndex: number;
}

export interface UseUserFeedReturn {
  videos: FeedVideo[];
  isLoading: boolean;
  isRefetching: boolean;
  hasError: boolean;
  activeIndex: number;
  listRef: React.RefObject<FlatList<FeedVideo>>;
  handleRetry: () => void;
  handleRefresh: () => void;
  onViewableItemsChanged: (info: UserFeedViewabilityChange) => void;
  viewabilityConfig: { itemVisiblePercentThreshold: number };
}

export interface UserFeedProps {
  userId: string;
  username: string | null;
  initialIndex: number;
}

export interface UserFeedViewabilityChange {
  viewableItems: Array<ViewToken<FeedVideo>>;
}
