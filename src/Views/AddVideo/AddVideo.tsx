import { Brand } from "@/constants/theme";
import { Icon } from "@ui-kitten/components";
import { Stack } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./AddVideo.styles";
import { useAddVideo } from "./useAddVideo";

const AddVideo = () => {
  const { t } = useTranslation();
  const {
    videoUri,
    caption,
    captionLength,
    isPosting,
    thumbUri,
    handlePickVideo,
    handlePickThumb,
    handleCaptionChange,
    handlePost,
    handleClose,
  } = useAddVideo();

  const player = useVideoPlayer(videoUri ?? null, (p) => {
    p.loop = true;
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const headerOptions = {
    title: t("addVideo.title"),
    headerStyle: { backgroundColor: Brand.card },
    headerTintColor: Brand.white,
    headerTitleStyle: {
      color: Brand.white,
      fontWeight: "bold" as const,
      letterSpacing: 1.5,
      fontSize: 14,
    },
    headerLeft: () => (
      <TouchableOpacity
        onPress={handleClose}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon
          name="close-outline"
          fill={Brand.white}
          style={{ width: 24, height: 24 }}
        />
      </TouchableOpacity>
    ),
  };

  return (
    <>
      <Stack.Screen options={headerOptions} />
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Video preview ── */}
          <TouchableOpacity
            style={styles.videoContainer}
            onPress={() => {
              if (!videoUri) return;
              if (isPlaying) {
                player.pause();
              } else {
                player.play();
              }
              setIsPlaying((p) => !p);
            }}
            activeOpacity={1}
          >
            {videoUri ? (
              <>
                <VideoView
                  player={player}
                  style={styles.videoPlayer}
                  contentFit="cover"
                  nativeControls={false}
                />
                {!isPlaying && (
                  <View style={styles.playOverlay} pointerEvents="none">
                    <View style={styles.playTriangle} />
                  </View>
                )}
              </>
            ) : (
              <View style={styles.videoPlaceholder}>
                <Icon
                  name="video-outline"
                  fill={Brand.gray}
                  style={{ width: 48, height: 48 }}
                />
                <Text style={styles.videoPlaceholderText}>
                  {t("addVideo.selectVideo").toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* ── Change video button ── */}
          <TouchableOpacity
            style={styles.changeVideoButton}
            onPress={handlePickVideo}
            activeOpacity={0.7}
          >
            <Icon
              name="refresh-outline"
              fill={Brand.gray}
              style={{ width: 16, height: 16 }}
            />
            <Text style={styles.changeVideoText}>
              {t("addVideo.changeVideo")}
            </Text>
          </TouchableOpacity>

          {/* ── Thumbnail ── */}
          <Text style={styles.sectionLabel}>
            {t("addVideo.thumbSectionLabel")}
          </Text>
          <View style={styles.thumbSection}>
            <TouchableOpacity
              style={styles.thumbCard}
              onPress={handlePickThumb}
              activeOpacity={0.7}
            >
              {thumbUri ? (
                <Image
                  source={{ uri: thumbUri }}
                  style={styles.thumbPreviewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.thumbUploadIcon}>
                  <Icon
                    name="image-outline"
                    fill={Brand.gray}
                    style={{ width: 36, height: 36 }}
                  />
                  <Text style={styles.thumbUploadLabel}>
                    {t("addVideo.thumbUploadLabel")}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Caption ── */}
          <Text style={styles.sectionLabel}>{t("addVideo.caption")}</Text>
          <TextInput
            style={styles.captionInput}
            value={caption}
            onChangeText={handleCaptionChange}
            placeholder={t("addVideo.captionPlaceholder")}
            placeholderTextColor={Brand.gray}
            multiline
            maxLength={2200}
            autoCapitalize="sentences"
          />
          <Text style={styles.captionCounter}>{captionLength}/2200</Text>
        </ScrollView>

        {/* ── Footer post button ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.postButton,
              (!videoUri || isPosting) && styles.postButtonDisabled,
            ]}
            onPress={handlePost}
            disabled={!videoUri || isPosting}
            activeOpacity={0.8}
          >
            {isPosting ? (
              <ActivityIndicator size="small" color={Brand.bg} />
            ) : (
              <>
                <Text style={styles.postButtonText}>
                  {t("addVideo.postNow")}
                </Text>
                <Icon
                  name="arrow-forward-outline"
                  fill={Brand.bg}
                  style={{ width: 18, height: 18 }}
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default AddVideo;
