import {
  AthleteProfileHeader,
  ProfileVideo,
  UserRole,
} from "@/processes/types/profileTypes";

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
}
