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
    state: boolean;
    birthDate: boolean;
    phone: boolean;
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
  handleAddPosition: (position: string) => void;
  handleRemovePosition: (position: string) => void;
  handleAddStrength: (strength: string) => void;
  handleRemoveStrength: (strength: string) => void;
  handleAddClub: (entry: ClubHistoryEntry) => void;
  handleRemoveClub: (index: number) => void;
  isDirty: boolean;
  handleSave: () => Promise<void>;
  handleClose: () => void;
}
