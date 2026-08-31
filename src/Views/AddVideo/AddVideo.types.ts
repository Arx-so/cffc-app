import type { VideoPlayer } from "expo-video";

export interface UseAddVideoReturn {
  videoUri: string;
  caption: string;
  captionLength: number;
  isPosting: boolean;
  isDirty: boolean;
  thumbUri: string | null;
  player: VideoPlayer;
  isPlaying: boolean;
  handleTogglePlay: () => void;
  handlePickVideo: () => Promise<void>;
  handlePickThumb: () => Promise<void>;
  handleRemoveThumb: () => void;
  handleCaptionChange: (text: string) => void;
  handlePost: () => void;
  handleClose: () => void;
}
