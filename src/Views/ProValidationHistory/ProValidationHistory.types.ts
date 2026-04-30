import { ValidatedAthleteResult } from "@/processes/types/profileTypes";

export interface UseProValidationHistoryReturn {
  athletes: ValidatedAthleteResult[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  handleViewProfile: (athlete: ValidatedAthleteResult) => void;
}
