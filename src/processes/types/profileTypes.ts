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
