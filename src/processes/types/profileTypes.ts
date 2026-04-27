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

export interface AthleteSearchResult {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  verified: boolean;
  positions: string[];
  validationCount: number;
  videoCount: number;
  contactCount: number;
  isShortlisted: boolean;
}

export interface ShortlistedAthlete extends AthleteSearchResult {
  phone: string | null;
}

export interface SearchFilters {
  positions: string[];
  ageMin: number | null;
  ageMax: number | null;
  dominantFoot: string | null;
  minHeight: number | null;
  maxWeight: number | null;
  strengths: string[];
}

/** Editable credential fields stored in `professional_profile`. */
export interface ProfessionalCredentialFields {
  specialty: string | null;
  registration_number: string | null;
  institution: string | null;
}

/** Full row in `professional_profile` (role `pro`). */
export interface ProfessionalProfile extends ProfessionalCredentialFields {
  user_id: string;
  /** Escala típica 0–5; atualizada no backend/admin, não pelo upsert de credenciais no app. */
  reputation_score: number | null;
}

export type ProfessionalDocumentStatus = "pending" | "approved" | "rejected";

export interface ProfessionalDocumentSummary {
  id: string;
  storagePath: string | null;
  status: ProfessionalDocumentStatus;
  created_at: string;
}

export interface ProIssuedValidationRow {
  id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  athleteName: string;
}

/** Data for the professional's own profile screen (tab Profile). */
export interface ProProfileScreenData {
  id: string;
  name: string;
  username: string | null;
  avatarUrl: string | null;
  verified: boolean;
  memberSinceYear: number;
  issuedValidationCount: number;
  reputationScore: number | null;
  credentials: ProfessionalCredentialFields;
  document: ProfessionalDocumentSummary | null;
  documentSignedUrl: string | null;
  recentValidations: ProIssuedValidationRow[];
}
