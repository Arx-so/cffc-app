export type UserRole = "athlete" | "pro" | "club" | "admin";

export interface ProfileStats {
  videoCount: number;
  validationCount: number;
  contactCount: number;
}

export type ProfileVideoStatus = "pending" | "approved" | "rejected";

export interface ProfileVideo {
  id: string;
  url: string;
  thumbUrl: string | null;
  status: ProfileVideoStatus;
}

export interface AthleteProfileHeader {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  role: UserRole;
  verified: boolean;
  city: string | null;
  state: string | null;
  stats: ProfileStats;
}

export interface ClubHistoryEntry {
  club: string;
  category: string;
  start: string;
  end: string;
}

export interface AthleteProfile {
  user_id: string;
  height: number | null;
  weight: number | null;
  dominant_foot: string | null;
  positions: string[];
  strengths: string[];
  current_category: string | null;
  availability: string | null;
  club_history: ClubHistoryEntry[];
  is_searchable: boolean;
  contact_visibility: string | null;
}

export interface ProfileData {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  city: string | null;
  state: string | null;
  birth_date: string | null;
  phone: string | null;
}
