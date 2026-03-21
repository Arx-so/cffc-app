import { supabase } from "@/config/supabase";
import {
  AthleteProfileHeader,
  ProfileVideo,
} from "./types/profileTypes";

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

  const [videoResult, validationResult, contactResult] = await Promise.all([
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
    avatarUrl: profile.avatar_url,
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

  return (data ?? []).map((item) => ({
    id: item.id,
    url: item.url,
    thumbUrl: item.thumb_url,
    status: item.status as ProfileVideo["status"],
  }));
};
