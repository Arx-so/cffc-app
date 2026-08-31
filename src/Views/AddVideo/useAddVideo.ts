import { createMediaRecord, uploadThumb, uploadVideo } from "@/processes/profile";
import { useEvent } from "expo";
import { useVideoPlayer } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import { useAuthStore } from "@/stores/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import { UseAddVideoReturn } from "./AddVideo.types";

export const useAddVideo = (): UseAddVideoReturn => {
  const { videoUri: rawUri } = useLocalSearchParams<{ videoUri: string }>();
  const videoUri = rawUri ? decodeURIComponent(rawUri) : "";

  const [caption, setCaption] = useState("");
  const [thumbUri, setThumbUri] = useState<string | null>(null);
  const currentUser = useAuthStore((s) => s.user);
  const userId = currentUser?.id ?? "";
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const isSavedRef = useRef(false);

  const player = useVideoPlayer(videoUri || null, (instance) => {
    instance.loop = true;
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const handleTogglePlay = useCallback(() => {
    if (!videoUri) return;
    if (player.playing) player.pause();
    else player.play();
  }, [player, videoUri]);

  const isDirty = caption.trim() !== "";

  const handleCaptionChange = useCallback((text: string) => {
    setCaption(text);
  }, []);

  const handlePickVideo = useCallback(async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Toast.show({ type: "error", text1: t("editProfile.permissionRequired") });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets[0]) return;

    const newUri = result.assets[0].uri;
    router.replace(`/add-video?videoUri=${encodeURIComponent(newUri)}`);
  }, [t]);

  const handlePickThumb = useCallback(async () => {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Toast.show({ type: "error", text1: t("editProfile.permissionRequired") });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;
    setThumbUri(result.assets[0].uri);
  }, [t]);

  const handleRemoveThumb = useCallback(() => {
    setThumbUri(null);
  }, []);

  const postMutation = useMutation({
    mutationFn: async () => {
      const storagePath = await uploadVideo(userId, videoUri);

      let resolvedThumbUri = thumbUri;
      if (!resolvedThumbUri) {
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, { time: 0 });
        resolvedThumbUri = uri;
      }
      const thumbPath = await uploadThumb(userId, resolvedThumbUri);

      await createMediaRecord(userId, storagePath, caption.trim(), thumbPath);
    },
    onSuccess: () => {
      isSavedRef.current = true;
      queryClient.invalidateQueries({ queryKey: ["profileVideos", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      Toast.show({ type: "success", text1: t("addVideo.successMessage") });
      router.back();
    },
    onError: () => {
      Toast.show({ type: "error", text1: t("editProfile.saveError") });
    },
  });

  const handlePost = useCallback(() => {
    postMutation.mutate();
  }, [postMutation]);

  const handleClose = useCallback(() => {
    if (isDirty) {
      Alert.alert(
        t("addVideo.discardTitle"),
        t("addVideo.discardMessage"),
        [
          { text: t("addVideo.discardCancel"), style: "cancel" },
          {
            text: t("addVideo.discardConfirm"),
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  }, [isDirty, t]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (isSavedRef.current) return;
      if (!isDirty) return;

      e.preventDefault();

      Alert.alert(
        t("addVideo.discardTitle"),
        t("addVideo.discardMessage"),
        [
          { text: t("addVideo.discardCancel"), style: "cancel" },
          {
            text: t("addVideo.discardConfirm"),
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isDirty, t]);

  return {
    videoUri,
    caption,
    captionLength: caption.length,
    isPosting: postMutation.isPending,
    isDirty,
    thumbUri,
    player,
    isPlaying,
    handleTogglePlay,
    handlePickVideo,
    handlePickThumb,
    handleRemoveThumb,
    handleCaptionChange,
    handlePost,
    handleClose,
  };
};
