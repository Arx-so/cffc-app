import { supabase } from "@/config/supabase";
import { getSignedUrl } from "@/utils/supabaseStorage";
import {
  AthleteProfile,
  AthleteProfileHeader,
  AthleteSearchResult,
  ClubHistoryEntry,
  ProfileData,
  ProfileVideo,
  SearchFilters,
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

  const [avatarUrl, videoResult, validationResult, contactResult] = await Promise.all([
    getSignedUrl(MEDIA_BUCKET, profile.avatar_url),
    supabase
      .from("media")
      .select("id", { count: "exact", head: true })
      .eq("athlete_user_id", userId)
      .eq("type", "video")
      .eq("status", "approved"),
    supabase
      .from("validation")
      .select("id", { count: "exact", head: true })
      .eq("athlete_user_id", userId)
      .eq("status", "approved"),
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
      validationCount: validationResult.count ?? 0,
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

export async function searchAthletes(
  query: string,
  filters: SearchFilters = DEFAULT_FILTERS
): Promise<AthleteSearchResult[]> {
  const { data: { user } } = await supabase.auth.getUser();

  let profileQuery = supabase
    .from("profile")
    .select("id, name, avatar_url, verified")
    .eq("role", "athlete");

  if (user) {
    profileQuery = profileQuery.neq("id", user.id);
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

  const [athleteProfilesResult, videoCounts, validationCounts, contactCounts] =
    await Promise.all([
      athleteProfileQuery,
      supabase
        .from("media")
        .select("athlete_user_id")
        .in("athlete_user_id", userIds)
        .eq("type", "video")
        .eq("status", "approved"),
      supabase
        .from("validation")
        .select("athlete_user_id")
        .in("athlete_user_id", userIds)
        .eq("status", "approved"),
      supabase
        .from("contact_request")
        .select("athlete_user_id")
        .in("athlete_user_id", userIds)
        .eq("status", "accepted"),
    ]);

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
    filtered = filtered.filter((p) =>
      filters.positions.some((pos) => positionsMap.get(p.id)?.includes(pos))
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
        avatarUrl,
        verified: p.verified ?? false,
        positions: positionsMap.get(p.id) ?? [],
        videoCount: countByUser(videoCounts.data, p.id),
        validationCount: countByUser(validationCounts.data, p.id),
        contactCount: countByUser(contactCounts.data, p.id),
      };
    })
  );

  return results;
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
