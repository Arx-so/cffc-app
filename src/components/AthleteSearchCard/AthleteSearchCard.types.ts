import { AthleteSearchResult } from "@/processes/types/profileTypes";

export interface AthleteSearchCardProps {
  athlete: AthleteSearchResult;
  onViewProfile?: () => void;
}
