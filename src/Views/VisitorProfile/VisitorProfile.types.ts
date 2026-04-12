import {
  AthleteProfileHeader,
  ProfileVideo,
} from "@/processes/types/profileTypes";

export interface VisitorProfileProps {
  userId: string;
  username: string | null;
}

export interface UseVisitorProfileReturn {
  profileData: AthleteProfileHeader | null;
  videos: ProfileVideo[];
  isLoading: boolean;
  isError: boolean;
  handleVideoPress: (item: ProfileVideo) => void;
}
