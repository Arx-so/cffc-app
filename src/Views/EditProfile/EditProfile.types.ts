import { ClubHistoryEntry } from "@/processes/types/profileTypes";

export interface ProfileFormState {
  name: string;
  username: string;
  city: string;
  state: string;
  birthDate: string;
  phone: string;
  avatarUrl: string | null;
}

export interface AthleteFormState {
  height: string;
  weight: string;
  dominantFoot: string | null;
  positions: string[];
  strengths: string[];
  currentCategory: string;
  availability: string;
  clubHistory: ClubHistoryEntry[];
  isSearchable: boolean;
  contactVisibility: string;
}

export interface UseEditProfileReturn {
  profileForm: ProfileFormState;
  athleteForm: AthleteFormState | null;
  isAthlete: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isUploadingAvatar: boolean;
  requiredFieldErrors: {
    name: boolean;
    username: boolean;
    city: boolean;
    birthDate: boolean;
  };

  setProfileField: <K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K]
  ) => void;
  setAthleteField: <K extends keyof AthleteFormState>(
    key: K,
    value: AthleteFormState[K]
  ) => void;

  handlePickAvatar: () => Promise<void>;
  onAvatarLoaded: () => void;
  handleTogglePosition: (position: string) => void;
  handleToggleStrength: (strength: string) => void;
  handleAddClub: (entry: ClubHistoryEntry) => void;
  handleRemoveClub: (index: number) => void;
  isDirty: boolean;
  handleSave: () => Promise<void>;
  handleClose: () => void;
  discardConfirmVisible: boolean;
  discardTitle: string;
  discardMessage: string;
  discardCancelLabel: string;
  discardConfirmLabel: string;
  confirmDiscard: () => void;
  cancelDiscard: () => void;
}
