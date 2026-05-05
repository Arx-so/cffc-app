import {
  AthleteProfile,
  AthleteProfileHeader,
  ProfileVideo,
} from "@/processes/types/profileTypes";

export interface ProfileProps {}

export interface AthleteOwnProfileExtraSlice {
  isLoading: boolean;
  birthDate: string | null;
  phone: string | null;
  athleteProfile: AthleteProfile | null;
}

export interface UseProfileReturn {
  profileData: AthleteProfileHeader | null;
  videos: ProfileVideo[];
  isLoading: boolean;
  isError: boolean;
  handleAddVideoPress: () => Promise<void>;
  handleVideoPress: (item: ProfileVideo) => void;
  athleteOwnProfileExtra: AthleteOwnProfileExtraSlice | null;
}
