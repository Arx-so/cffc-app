import { supabase } from "@/config/supabase";
import { expandPositionFilter } from "@/constants/athleteAttributes";
import {
  fetchApprovedValidationCountsByAthleteIds,
  validationCountsMapGet,
} from "@/processes/validationStats";
import { getSignedUrl } from "@/utils/supabaseStorage";
import {
    AthleteProfile,
    AthleteProfileHeader,
    AthleteSearchResult,
    ClubHistoryEntry,
    ProfileData,
    ProfileVideo,
    SearchFilters,
    ShortlistedAthlete,
    UserRole,
} from "./types/profileTypes";

const MEDIA_BUCKET = "media";

export const fetchAthleteProfile = async (
  userId: string
): Promise<AthleteProfileHeader> => {
  const { data: profile, error } = await supabase
    .from("profile")
    .select("id, name, username, avatar_url, role, verified, city, state")
    .eq("id", userId)
    .single();

  if (error) throw error;
  if (!profile) throw new Error("Profile not found");

  const [avatarUrl, videoResult, validationCountByAthlete, contactResult] =
    await Promise.all([
      getSignedUrl(MEDIA_BUCKET, profile.avatar_url),
      supabase
        .from("media")
        .select("id", { count: "exact", head: true })
        .eq("athlete_user_id", userId)
        .eq("type", "video")
        .eq("status", "approved"),
      fetchApprovedValidationCountsByAthleteIds([userId]),
      supabase
        .from("contact_request")
        .select("id", { count: "exact", head: true })
        .eq("athlete_user_id", userId)
        .eq("status", "accepted"),
    ]);

  return {
    id: profile.id,
    name: profile.name ?? "",
    username: profile.username,
    avatarUrl,
    role: profile.role,
    verified: profile.verified ?? false,
    city: profile.city,
    state: profile.state,
    stats: {
      videoCount: videoResult.count ?? 0,
      validationCount: validationCountsMapGet(validationCountByAthlete, userId),
      contactCount: contactResult.count ?? 0,
    },
  };
};

export const fetchProfileVideos = async (
  userId: string
): Promise<ProfileVideo[]> => {
  const { data, error } = await supabase
    .from("media")
    .select("id, url, thumb_url, status")
    .eq("athlete_user_id", userId)
    .eq("type", "video")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) throw error;

  const rows = data ?? [];

  const signed = await Promise.all(
    rows.map(async (item) => ({
      id: item.id,
      url: (await getSignedUrl(MEDIA_BUCKET, item.url)) ?? item.url,
      thumbUrl: await getSignedUrl(MEDIA_BUCKET, item.thumb_url),
      status: item.status as ProfileVideo["status"],
    }))
  );

  return signed;
};

export const fetchProfileForEdit = async (
  userId: string
): Promise<ProfileData> => {
  const { data, error } = await supabase
    .from("profile")
    .select("id, name, username, avatar_url, city, state, birth_date, phone")
    .eq("id", userId)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Profile not found");

  const avatarUrl = await getSignedUrl(MEDIA_BUCKET, data.avatar_url);

  return {
    id: data.id,
    name: data.name,
    username: data.username,
    avatar_url: avatarUrl,
    city: data.city,
    state: data.state,
    birth_date: data.birth_date,
    phone: data.phone,
  };
};

export const fetchCurrentUserAvatar = async (
  userId: string
): Promise<string | null> => {
  const { data, error } = await supabase
    .from("profile")
    .select("avatar_url")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return getSignedUrl(MEDIA_BUCKET, data?.avatar_url ?? null);
};

/** Birth and phone only — avoids signing avatar URLs on profile home. */
export async function fetchProfilePersonalFields(
  userId: string
): Promise<{ birth_date: string | null; phone: string | null }> {
  const { data, error } = await supabase
    .from("profile")
    .select("birth_date, phone")
    .eq("id", userId)
    .single();

  if (error) throw error;
  if (!data) throw new Error("Profile not found");

  return {
    birth_date: data.birth_date,
    phone: data.phone,
  };
}

export const updateProfile = async (
  userId: string,
  payload: Partial<Omit<ProfileData, "id" | "avatar_url">>
): Promise<void> => {
  const { error } = await supabase
    .from("profile")
    .update(payload)
    .eq("id", userId);

  if (error) throw error;
};

export const fetchAthleteProfileData = async (
  userId: string
): Promise<AthleteProfile | null> => {
  const { data, error } = await supabase
    .from("athlete_profile")
    .select(
      "user_id, height, weight, dominant_foot, positions, strengths, current_category, availability, club_history, is_searchable, contact_visibility"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    user_id: data.user_id,
    height: data.height,
    weight: data.weight,
    dominant_foot: data.dominant_foot,
    positions: data.positions ?? [],
    strengths: data.strengths ?? [],
    current_category: data.current_category,
    availability: data.availability,
    club_history: (data.club_history as ClubHistoryEntry[]) ?? [],
    is_searchable: data.is_searchable ?? true,
    contact_visibility: data.contact_visibility,
  };
};

export const upsertAthleteProfile = async (
  userId: string,
  payload: Omit<AthleteProfile, "user_id">
): Promise<void> => {
  const { error } = await supabase
    .from("athlete_profile")
    .upsert(
      { user_id: userId, ...payload, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

  if (error) throw error;
};

const isMissingRpcError = (error: { code?: string; message?: string }): boolean => {
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST202" ||
    error.code === "42883" ||
    msg.includes("could not find") ||
    msg.includes("schema cache")
  );
};

/**
 * Ensures athlete_profile exists only for athletes.
 * Prefers RPC `cffc_sync_athlete_profile_for_role` (SECURITY DEFINER) so delete works even when
 * RLS blocks direct DELETE on athlete_profile. Apply migration in supabase/migrations/.
 */
export const syncAthleteProfileRowForRole = async (
  userId: string,
  role: UserRole | null
): Promise<void> => {
  if (role === null) return;

  const { error: rpcError } = await supabase.rpc("cffc_sync_athlete_profile_for_role", {
    p_user_id: userId,
    p_role: role,
  });

  if (!rpcError) return;

  if (!isMissingRpcError(rpcError)) {
    throw rpcError;
  }

  if (role === "athlete") {
    const { error } = await supabase
      .from("athlete_profile")
      .upsert({ user_id: userId }, { onConflict: "user_id" });
    if (error) throw error;
    return;
  }
  if (role === "pro" || role === "club" || role === "admin") {
    const { error } = await supabase
      .from("athlete_profile")
      .delete()
      .eq("user_id", userId);
    if (error) throw error;
  }
};

/**
 * Keeps professional_profile aligned with role (SECURITY DEFINER RPC when available).
 * Apply migration `20260419120000_professional_profile.sql`.
 */
export const syncProfessionalProfileRowForRole = async (
  userId: string,
  role: UserRole | null
): Promise<void> => {
  if (role === null) return;

  const { error: rpcError } = await supabase.rpc("cffc_sync_professional_profile_for_role", {
    p_user_id: userId,
    p_role: role,
  });

  if (!rpcError) return;

  if (!isMissingRpcError(rpcError)) {
    throw rpcError;
  }

  if (role === "pro") {
    const { error } = await supabase
      .from("professional_profile")
      .upsert({ user_id: userId }, { onConflict: "user_id" });
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("professional_profile")
    .delete()
    .eq("user_id", userId);
  if (error) throw error;
};

/** After signUp, correct profile.role and athlete_profile when a session exists (email confirm off). */
export const applySignupRoleFromClient = async (
  userId: string,
  role: "athlete" | "pro" | "club"
): Promise<void> => {
  const { error } = await supabase
    .from("profile")
    .update({ role })
    .eq("id", userId);
  if (error) throw error;
  await syncAthleteProfileRowForRole(userId, role);
  await syncProfessionalProfileRowForRole(userId, role);
};

export const uploadVideo = async (
  userId: string,
  uri: string
): Promise<string> => {
  const ext = uri.split(".").pop() ?? "mp4";
  const uuid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = `url/${userId}/${uuid}.${ext}`;

  const response = await fetch(uri);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: `video/${ext}`,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  return path;
};

export const uploadThumb = async (
  userId: string,
  uri: string
): Promise<string> => {
  const ext = uri.split(".").pop() ?? "jpg";
  const path = `thumb_url/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const response = await fetch(uri);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: `image/${ext}`,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  return path;
};

export const createMediaRecord = async (
  userId: string,
  storagePath: string,
  caption: string,
  thumbUrl?: string
): Promise<void> => {
  const { error } = await supabase.from("media").insert({
    athlete_user_id: userId,
    type: "video",
    status: "pending",
    url: storagePath,
    title: caption || null,
    thumb_url: thumbUrl ?? null,
  });

  if (error) throw error;
};

const DEFAULT_FILTERS: SearchFilters = {
  positions: [],
  ageMin: null,
  ageMax: null,
  dominantFoot: null,
  minHeight: null,
  maxWeight: null,
  strengths: [],
};

/** When set, that profile id is omitted from results (viewer must not see their own row). */
export async function searchAthletes(
  query: string,
  filters: SearchFilters = DEFAULT_FILTERS,
  clubUserId?: string,
  excludeViewerId?: string | null
): Promise<AthleteSearchResult[]> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const excludeId = excludeViewerId ?? authUser?.id;

  let profileQuery = supabase
    .from("profile")
    .select("id, name, username, avatar_url, verified")
    .eq("role", "athlete");

  if (excludeId) {
    profileQuery = profileQuery.neq("id", excludeId);
  }

  if (query.length >= 3) {
    profileQuery = profileQuery.ilike("name", `%${query}%`);
  }

  const today = new Date();
  if (filters.ageMin !== null) {
    const maxBirth = new Date(today);
    maxBirth.setFullYear(maxBirth.getFullYear() - filters.ageMin);
    profileQuery = profileQuery.lte("birth_date", maxBirth.toISOString().split("T")[0]);
  }
  if (filters.ageMax !== null) {
    const minBirth = new Date(today);
    minBirth.setFullYear(minBirth.getFullYear() - filters.ageMax);
    profileQuery = profileQuery.gte("birth_date", minBirth.toISOString().split("T")[0]);
  }

  const { data: profiles, error } = await profileQuery.limit(20);

  if (error) throw error;
  if (!profiles || profiles.length === 0) return [];

  const userIds = profiles.map((p) => p.id);

  let athleteProfileQuery = supabase
    .from("athlete_profile")
    .select("user_id, positions, strengths, is_searchable")
    .in("user_id", userIds)
    .eq("is_searchable", true);

  if (filters.dominantFoot !== null) {
    athleteProfileQuery = athleteProfileQuery.eq("dominant_foot", filters.dominantFoot);
  }
  if (filters.minHeight !== null) {
    athleteProfileQuery = athleteProfileQuery.gte("height", filters.minHeight);
  }
  if (filters.maxWeight !== null) {
    athleteProfileQuery = athleteProfileQuery.lte("weight", filters.maxWeight);
  }

  const shortlistQuery = clubUserId
    ? supabase
        .from("club_shortlist")
        .select("athlete_user_id")
        .eq("club_user_id", clubUserId)
        .in("athlete_user_id", userIds)
    : null;

  const [athleteProfilesResult, videoCounts, contactCounts, shortlistResult, validationCountByAthlete] =
    await Promise.all([
      athleteProfileQuery,
      supabase
        .from("media")
        .select("athlete_user_id")
        .in("athlete_user_id", userIds)
        .eq("type", "video")
        .eq("status", "approved"),
      supabase
        .from("contact_request")
        .select("athlete_user_id")
        .in("athlete_user_id", userIds)
        .eq("status", "accepted"),
      shortlistQuery ?? Promise.resolve({ data: [] }),
      fetchApprovedValidationCountsByAthleteIds(userIds),
    ]);

  const shortlistedIds = new Set(
    (shortlistResult.data ?? []).map((r: { athlete_user_id: string }) => r.athlete_user_id)
  );

  const searchableIds = new Set(
    (athleteProfilesResult.data ?? []).map((ap) => ap.user_id)
  );
  const positionsMap = new Map(
    (athleteProfilesResult.data ?? []).map((ap) => [
      ap.user_id,
      (ap.positions as string[]) ?? [],
    ])
  );
  const strengthsMap = new Map(
    (athleteProfilesResult.data ?? []).map((ap) => [
      ap.user_id,
      (ap.strengths as string[]) ?? [],
    ])
  );

  const countByUser = (rows: { athlete_user_id: string }[] | null, id: string) =>
    (rows ?? []).filter((r) => r.athlete_user_id === id).length;

  let filtered = profiles.filter((p) => searchableIds.has(p.id));

  if (filters.positions.length > 0) {
    const wantedPositions = expandPositionFilter(filters.positions);
    filtered = filtered.filter((p) =>
      wantedPositions.some((pos) => positionsMap.get(p.id)?.includes(pos))
    );
  }
  if (filters.strengths.length > 0) {
    filtered = filtered.filter((p) =>
      filters.strengths.some((str) => strengthsMap.get(p.id)?.includes(str))
    );
  }

  const results = await Promise.all(
    filtered.map(async (p) => {
      const avatarUrl = await getSignedUrl(MEDIA_BUCKET, p.avatar_url);
      return {
        id: p.id,
        name: p.name ?? "",
        username: p.username ?? null,
        avatarUrl,
        verified: p.verified ?? false,
        positions: positionsMap.get(p.id) ?? [],
        videoCount: countByUser(videoCounts.data, p.id),
        validationCount: validationCountsMapGet(validationCountByAthlete, p.id),
        contactCount: countByUser(contactCounts.data, p.id),
        isShortlisted: shortlistedIds.has(p.id),
      };
    })
  );

  return excludeId ? results.filter((r) => r.id !== excludeId) : results;
}

export async function addToClubShortlist(athleteUserId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("club_shortlist")
    .upsert(
      { club_user_id: user.id, athlete_user_id: athleteUserId },
      { onConflict: "club_user_id,athlete_user_id" }
    );

  if (error) throw error;
}

export async function fetchClubShortlist(
  clubUserId: string,
  query: string = ""
): Promise<ShortlistedAthlete[]> {
  const { data: shortlist, error: shortlistError } = await supabase
    .from("club_shortlist")
    .select("athlete_user_id")
    .eq("club_user_id", clubUserId);

  if (shortlistError) throw shortlistError;
  if (!shortlist || shortlist.length === 0) return [];

  const userIds = shortlist.map((s: { athlete_user_id: string }) => s.athlete_user_id);

  let profileQuery = supabase
    .from("profile")
    .select("id, name, username, avatar_url, verified, phone")
    .in("id", userIds);

  if (query.length >= 2) {
    profileQuery = profileQuery.or(`name.ilike.%${query}%,username.ilike.%${query}%`);
  }

  const { data: profiles, error: profilesError } = await profileQuery;

  if (profilesError) throw profilesError;
  if (!profiles || profiles.length === 0) return [];

  const profileIds = profiles.map((p: { id: string }) => p.id);

  const [athleteProfilesResult, videoCounts, contactCounts, validationCountByAthlete] =
    await Promise.all([
      supabase
        .from("athlete_profile")
        .select("user_id, positions")
        .in("user_id", profileIds),
      supabase
        .from("media")
        .select("athlete_user_id")
        .in("athlete_user_id", profileIds)
        .eq("type", "video")
        .eq("status", "approved"),
      supabase
        .from("contact_request")
        .select("athlete_user_id")
        .in("athlete_user_id", profileIds)
        .eq("status", "accepted"),
      fetchApprovedValidationCountsByAthleteIds(profileIds),
    ]);

  const positionsMap = new Map(
    (athleteProfilesResult.data ?? []).map((ap: { user_id: string; positions: string[] }) => [
      ap.user_id,
      (ap.positions as string[]) ?? [],
    ])
  );

  const countByUser = (rows: { athlete_user_id: string }[] | null, id: string) =>
    (rows ?? []).filter((r) => r.athlete_user_id === id).length;

  return await Promise.all(
    profiles.map(async (p: { id: string; name: string | null; username: string | null; avatar_url: string | null; verified: boolean; phone: string | null }) => {
      const avatarUrl = await getSignedUrl(MEDIA_BUCKET, p.avatar_url);
      return {
        id: p.id,
        name: p.name ?? "",
        username: p.username ?? null,
        avatarUrl,
        verified: p.verified ?? false,
        positions: positionsMap.get(p.id) ?? [],
        videoCount: countByUser(videoCounts.data, p.id),
        validationCount: validationCountsMapGet(validationCountByAthlete, p.id),
        contactCount: countByUser(contactCounts.data, p.id),
        isShortlisted: true,
        phone: p.phone ?? null,
      };
    })
  );
}

export const uploadAvatar = async (
  userId: string,
  uri: string
): Promise<string> => {
  const ext = uri.split(".").pop() ?? "jpg";
  const path = `avatar_url/${userId}.${ext}`;

  const response = await fetch(uri);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, arrayBuffer, {
      contentType: `image/${ext}`,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { error: updateError } = await supabase
    .from("profile")
    .update({ avatar_url: path })
    .eq("id", userId);

  if (updateError) throw updateError;

  const signedUrl = await getSignedUrl(MEDIA_BUCKET, path);
  return signedUrl ?? "";
};
