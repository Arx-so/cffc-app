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

export interface ValidationChecklist {
  antropometria?: {
    height_cm?: number;
    weight_kg?: number;
    bmi?: number;
    wingspan_cm?: number;
    body_fat_pct?: number;
    lean_mass_kg?: number;
  };
  bioimpedancia?: {
    body_fat_pct?: number;
    visceral_fat?: number;
    muscle_mass_kg?: number;
    hydration_pct?: number;
    basal_metabolic_rate?: number;
  };
  dinamometria?: {
    grip_left_kg?: number;
    grip_right_kg?: number;
  };
  bioquimica?: {
    ast?: number;
    alt?: number;
    urea?: number;
    creatinine?: number;
    glucose?: number;
    hba1c?: number;
    total_cholesterol?: number;
    ldl?: number;
    hdl?: number;
    tg?: number;
    total_protein?: number;
    albumin?: number;
  };
  vo2max?: {
    vo2max_ml_kg_min?: number;
    max_hr_bpm?: number;
    protocol?: string;
  };
  yoyo_test?: {
    type?: "IR1" | "IR2";
    distance_m?: number;
    level?: number;
    speed_km_h?: number;
  };
  shuttle_run_20m?: {
    time_s?: number;
    shuttles?: number;
  };
  wingate?: {
    peak_power_w?: number;
    mean_power_w?: number;
    fatigue_index_pct?: number;
  };
  rast?: {
    peak_power_w?: number;
    mean_power_w?: number;
    fatigue_index_pct?: number;
    best_sprint_s?: number;
  };
  forca_potencia?: {
    squat_jump_cm?: number;
    cmj_cm?: number;
    horizontal_jump_cm?: number;
  };
  velocidade_aceleracao?: {
    sprint_10m_s?: number;
    sprint_20m_s?: number;
    sprint_30m_s?: number;
    sprint_40m_s?: number;
  };
  agilidade?: {
    test_name?: string;
    time_s?: number;
    score?: number;
  };
  resistencia_muscular?: {
    abdominal_reps?: number;
    canguru_reps?: number;
  };
  flexibilidade?: {
    sit_and_reach_cm?: number;
  };
  acwr?: {
    acute_load?: number;
    chronic_load?: number;
    ratio?: number;
  };
  odontologia?: {
    exame_clinico_done?: boolean;
    exame_clinico_notes?: string;
    rx_panoramico_done?: boolean;
    rx_interproximal_done?: boolean;
    rx_findings?: string;
    exames_complementares?: string;
  };
  psicologia?: {
    coping_acsi28?: number;
    motivacao?: number;
    csai2r_cognitive?: number;
    csai2r_somatic?: number;
    csai2r_self_confidence?: number;
    brums_vigor?: number;
    brums_tension?: number;
    brums_depression?: number;
    brums_anger?: number;
    brums_fatigue?: number;
    brums_confusion?: number;
    group_integration_score?: number;
    psychological_load?: "low" | "medium" | "high";
    cognitive_skills_notes?: string;
  };
}
