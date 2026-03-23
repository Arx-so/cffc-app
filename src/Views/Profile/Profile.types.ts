import {
  AthleteProfileHeader,
  ProfileVideo,
  UserRole,
} from "@/processes/types/profileTypes";

export interface ProfileProps {
  userId?: string;
}

export interface UseProfileReturn {
  profileData: AthleteProfileHeader | null;
  videos: ProfileVideo[];
  isOwnProfile: boolean;
  viewerRole: UserRole;
  isLoading: boolean;
  isError: boolean;
  handleAddVideoPress: () => Promise<void>;
}
