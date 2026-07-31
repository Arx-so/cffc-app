import { Brand } from "@/constants/theme";
import { FeedVideo } from "@/processes/types/feedTypes";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { useEvent } from "expo";
import { Button, Spinner, Text } from "@ui-kitten/components";
import { VideoView, useVideoPlayer } from "expo-video";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles } from "./UserFeed.styles";
import { useUserFeed } from "./useUserFeed";
import { UserFeedProps } from "./UserFeed.types";

interface UserFeedVideoSlideProps {
  video: FeedVideo;
  isActive: boolean;
  isScreenFocused: boolean;
  height: number;
}

const UserFeedVideoSlide = ({
  video,
  isActive,
  isScreenFocused,
  height,
}: UserFeedVideoSlideProps) => {
  const player = useVideoPlayer(video.url, (currentPlayer) => {
    currentPlayer.loop = true;
    currentPlayer.timeUpdateEventInterval = 0.25;
  });
  const { status } = useEvent(player, "statusChange", {
    status: player.status,
  });
  const { currentTime } = useEvent(player, "timeUpdate", {
    currentTime: 0,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    bufferedPosition: 0,
  });
  const { duration } = useEvent(player, "sourceLoad", {
    videoSource: null,
    duration: 0,
    availableVideoTracks: [],
    availableSubtitleTracks: [],
    availableAudioTracks: [],
  });
  const [hasRenderedFirstFrame, setHasRenderedFirstFrame] = useState(false);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [progressTrackWidth, setProgressTrackWidth] = useState(0);
  const shouldPlay = isActive && isScreenFocused;

  useEffect(() => {
    if (shouldPlay && !isManuallyPaused) {
      player.play();
      return;
    }
    player.pause();
  }, [shouldPlay, isManuallyPaused, player]);

  useEffect(() => {
    if (status === "loading") {
      setHasRenderedFirstFrame(false);
    }
  }, [status]);

  useEffect(() => {
    setHasRenderedFirstFrame(false);
    setIsManuallyPaused(false);
  }, [video.url]);

  const isVideoLoading =
    status === "idle" || status === "loading" || !hasRenderedFirstFrame;
  const progress =
    duration > 0 ? Math.min(Math.max(currentTime / duration, 0), 1) : 0;

  const handleSeek = useCallback(
    (locationX: number) => {
      if (duration <= 0 || progressTrackWidth <= 0) return;
      const nextProgress = Math.min(
        Math.max(locationX / progressTrackWidth, 0),
        1
      );
      player.currentTime = nextProgress * duration;
    },
    [duration, progressTrackWidth, player]
  );

  const handleTogglePlayback = useCallback(() => {
    if (!isActive || !isScreenFocused || isVideoLoading) return;
    setIsManuallyPaused((prev) => !prev);
  }, [isActive, isScreenFocused, isVideoLoading]);

  useEffect(() => {
    if (!isActive || !isScreenFocused) {
      setIsManuallyPaused(false);
    }
  }, [isActive, isScreenFocused]);

  return (
    <View style={[styles.slide, { height }]}>
      <Pressable style={styles.tapArea} onPress={handleTogglePlayback}>
        <VideoView
          player={player}
          style={styles.video}
          contentFit="cover"
          nativeControls={false}
          onFirstFrameRender={() => setHasRenderedFirstFrame(true)}
        />
        {isVideoLoading && (
          <View style={styles.videoLoadingOverlay} pointerEvents="none">
            <Spinner status="primary" />
          </View>
        )}
        <View style={styles.overlay} />
        {isManuallyPaused && !isVideoLoading && (
          <View style={styles.centerIconWrapper} pointerEvents="none">
            <View style={styles.centerIconBackground}>
              <Ionicons
                name="play"
                size={30}
                color={Brand.white}
                style={styles.centerIcon}
              />
            </View>
          </View>
        )}
        {!!video.title && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionText}>
              {video.title}
            </Text>
          </View>
        )}
      </Pressable>
      <View
        style={styles.progressTrack}
        onLayout={(event) =>
          setProgressTrackWidth(event.nativeEvent.layout.width)
        }
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => handleSeek(event.nativeEvent.locationX)}
        onResponderMove={(event) => handleSeek(event.nativeEvent.locationX)}
      >
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        <View
          style={[styles.progressThumb, { left: `${progress * 100}%` }]}
        />
      </View>
    </View>
  );
};

export const UserFeed = ({ userId, username, initialIndex }: UserFeedProps) => {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const isScreenFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const {
    videos,
    isLoading,
    isRefetching,
    hasError,
    activeIndex,
    listRef,
    handleRetry,
    handleRefresh,
    onViewableItemsChanged,
    viewabilityConfig,
  } = useUserFeed({ userId, initialIndex });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner status="primary" />
        <Text style={styles.loadingText}>{t("userFeed.loading")}</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text category="s1" style={styles.errorText}>
          {t("userFeed.loadError")}
        </Text>
        <Button size="small" onPress={handleRetry}>
          {t("common.retry")}
        </Button>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text category="h6" style={styles.emptyTitle}>
          {t("userFeed.emptyTitle")}
        </Text>
        <Text category="s1" style={styles.emptySubtitle}>
          {t("userFeed.emptySubtitle")}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item, index }: ListRenderItemInfo<FeedVideo>) => (
    <UserFeedVideoSlide
      video={item}
      isActive={index === activeIndex}
      isScreenFocused={isScreenFocused}
      height={height}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={videos}
        extraData={activeIndex}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={height}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onRefresh={handleRefresh}
        refreshing={isRefetching && !isLoading}
        getItemLayout={(_, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        removeClippedSubviews
        contentContainerStyle={{ backgroundColor: Brand.bg }}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 500));
          wait.then(() => {
            listRef.current?.scrollToIndex({
              index: info.index,
              animated: false,
            });
          });
        }}
      />
      <View
        style={[styles.headerOverlay, { paddingTop: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        <Pressable
          style={styles.headerBackButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Brand.white} />
        </Pressable>
        <Text category="s1" style={styles.headerTitle}>
          {username ? `@${username}` : t("userFeed.headerTitle")}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
    </View>
  );
};

export default UserFeed;
