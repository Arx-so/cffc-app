import { Brand } from "@/constants/theme";
import { FeedVideo } from "@/processes/types/feedTypes";
import { useIsFocused } from "@react-navigation/native";
import { useEvent } from "expo";
import { Button, Spinner, Text } from "@ui-kitten/components";
import { VideoView, useVideoPlayer } from "expo-video";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, ListRenderItemInfo, useWindowDimensions, View } from "react-native";
import { styles } from "./HomeFeed.styles";
import { useHomeFeed } from "./useHomeFeed";

interface FeedVideoSlideProps {
  video: FeedVideo;
  isActive: boolean;
  isScreenFocused: boolean;
  height: number;
}

const FeedVideoSlide = ({
  video,
  isActive,
  isScreenFocused,
  height,
}: FeedVideoSlideProps) => {
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
  const [progressTrackWidth, setProgressTrackWidth] = useState(0);
  const shouldPlay = isActive && isScreenFocused;

  useEffect(() => {
    if (shouldPlay) {
      player.play();
      return;
    }

    player.pause();
  }, [shouldPlay, player]);

  useEffect(() => {
    if (status === "loading") {
      setHasRenderedFirstFrame(false);
    }
  }, [status]);

  useEffect(() => {
    setHasRenderedFirstFrame(false);
  }, [video.url]);

  const isVideoLoading =
    status === "idle" || status === "loading" || !hasRenderedFirstFrame;
  const progress = duration > 0 ? Math.min(Math.max(currentTime / duration, 0), 1) : 0;

  const handleSeek = useCallback(
    (locationX: number) => {
      if (duration <= 0 || progressTrackWidth <= 0) return;

      const nextProgress = Math.min(Math.max(locationX / progressTrackWidth, 0), 1);
      player.currentTime = nextProgress * duration;
    },
    [duration, progressTrackWidth, player]
  );

  return (
    <View style={[styles.slide, { height }]}>
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
      {(!!video.username || !!video.title) && (
        <View style={styles.captionContainer}>
          {!!video.username && (
            <Text category="h6" style={styles.usernameText}>
              @{video.username}
            </Text>
          )}
          {!!video.title && (
            <Text category="s1" style={styles.captionText}>
              {video.title}
            </Text>
          )}
        </View>
      )}
      <View
        style={styles.progressTrack}
        onLayout={(event) => setProgressTrackWidth(event.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => handleSeek(event.nativeEvent.locationX)}
        onResponderMove={(event) => handleSeek(event.nativeEvent.locationX)}
      >
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        <View style={[styles.progressThumb, { left: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const HomeFeed = () => {
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const isScreenFocused = useIsFocused();
  const {
    videos,
    isLoading,
    isRefetching,
    hasError,
    activeIndex,
    handleRetry,
    handleRefresh,
    onViewableItemsChanged,
    viewabilityConfig,
  } = useHomeFeed();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner status="primary" />
        <Text style={styles.loadingText}>{t("homeFeed.loading")}</Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text category="s1" style={styles.errorText}>
          {t("homeFeed.loadError")}
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
          {t("homeFeed.emptyTitle")}
        </Text>
        <Text category="s1" style={styles.emptySubtitle}>
          {t("homeFeed.emptySubtitle")}
        </Text>
      </View>
    );
  }

  const renderItem = ({ item, index }: ListRenderItemInfo<FeedVideo>) => (
    <FeedVideoSlide
      video={item}
      isActive={index === activeIndex}
      isScreenFocused={isScreenFocused}
      height={height}
    />
  );

  return (
    <FlatList
      data={videos}
      extraData={activeIndex}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      pagingEnabled
      snapToInterval={height}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      style={styles.container}
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
    />
  );
};

export default HomeFeed;
