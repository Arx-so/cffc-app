import {
  AthleteProfileHeader,
  ProfileVideo,
  UserRole,
} from "@/processes/types/profileTypes";
import type { AthleteOwnProfileExtraSlice } from "@/Views/Profile/Profile.types";

export interface VisitorProfileProps {
  userId: string;
  username: string | null;
  viewerRole?: UserRole | null;
}

export interface UseVisitorProfileReturn {
  profileData: AthleteProfileHeader | null;
  videos: ProfileVideo[];
  isLoading: boolean;
  isError: boolean;
  hasExistingValidation: boolean;
  handleVideoPress: (item: ProfileVideo) => void;
  handleEmitValidation: () => void;
  /** Same fields as “Meu perfil” details card; null when visited user is not an athlete. */
  visitorAthleteDetailsExtra: AthleteOwnProfileExtraSlice | null;
}
