import { AthleteSearchResult, UserRole } from "@/processes/types/profileTypes";

export interface UseSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  athletes: AthleteSearchResult[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  openFilter: () => void;
  hasActiveFilters: boolean;
  handleViewProfile: (athlete: AthleteSearchResult) => void;
  handleAddFavorite: (athleteId: string) => void;
  addingAthleteId: string | null;
  role: UserRole | null;
}
