import { ShortlistedAthlete } from "@/processes/types/profileTypes";

export interface UseFavoritesReturn {
  query: string;
  setQuery: (q: string) => void;
  athletes: ShortlistedAthlete[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  handleContact: (phone: string | null) => void;
  handleViewProfile: (athlete: ShortlistedAthlete) => void;
}
