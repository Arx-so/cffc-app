export interface UseAddVideoReturn {
  videoUri: string;
  caption: string;
  captionLength: number;
  isPosting: boolean;
  isDirty: boolean;
  thumbUri: string | null;
  handlePickVideo: () => Promise<void>;
  handlePickThumb: () => Promise<void>;
  handleCaptionChange: (text: string) => void;
  handlePost: () => void;
  handleClose: () => void;
}
