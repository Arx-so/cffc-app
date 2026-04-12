import {
  AthleteProfileHeader,
  ProfileVideo,
} from "@/processes/types/profileTypes";

export interface ProfileProps {}

export interface UseProfileReturn {
  profileData: AthleteProfileHeader | null;
  videos: ProfileVideo[];
  isLoading: boolean;
  isError: boolean;
  handleAddVideoPress: () => Promise<void>;
  handleVideoPress: (item: ProfileVideo) => void;
}
