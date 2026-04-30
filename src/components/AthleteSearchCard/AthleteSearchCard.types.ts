import { AthleteSearchResult } from "@/processes/types/profileTypes";
import React from "react";

export interface AthleteSearchCardProps {
  athlete: AthleteSearchResult;
  onViewProfile?: () => void;
  onAddFavorite?: () => void;
  isShortlisted?: boolean;
  isAddingToShortlist?: boolean;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
}
