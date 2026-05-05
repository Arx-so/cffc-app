import { supabase } from "@/config/supabase";
import {
  fetchApprovedValidationCountsByAthleteIds,
  validationCountsMapGet,
} from "@/processes/validationStats";
import { getSignedUrl } from "@/utils/supabaseStorage";
import type { AthleteSearchResult, ValidatedAthleteResult, ValidationChecklist, ValidationStatus } from "@/processes/types/profileTypes";

const MEDIA_BUCKET = "media";

export const hasExistingValidation = async (
  athleteUserId: string,
  professionalUserId: string
): Promise<boolean> => {
  const { count, error } = await supabase
    .from("validation")
    .select("id", { count: "exact", head: true })
    .eq("athlete_user_id", athleteUserId)
    .eq("professional_user_id", professionalUserId);

  if (error) throw error;
  return (count ?? 0) > 0;
};

export const submitValidation = async (params: {
  athleteUserId: string;
  professionalUserId: string;
  checklist: ValidationChecklist;
  note: string;
}): Promise<void> => {
  const { athleteUserId, professionalUserId, checklist, note } = params;

  const { error } = await supabase.from("validation").insert({
    athlete_user_id: athleteUserId,
    professional_user_id: professionalUserId,
    professional_role: "pro",
    checklist,
    note: note.trim() || null,
    status: "pending",
  });

  if (error) throw error;
};

export const fetchValidatedAthletes = async (
  professionalUserId: string
): Promise<ValidatedAthleteResult[]> => {
  const { data: validations, error: valError } = await supabase
    .from("validation")
    .select("athlete_user_id, status")
    .eq("professional_user_id", professionalUserId)
    .order("created_at", { ascending: true });

  if (valError) throw valError;
  if (!validations || validations.length === 0) return [];

  // Keep only the latest validation per athlete (last in array = most recent)
  const statusByAthlete = new Map<string, ValidationStatus>();
  for (const v of validations) {
    statusByAthlete.set(v.athlete_user_id as string, v.status as ValidationStatus);
  }
  const userIds = [...statusByAthlete.keys()];

  const [profilesResult, athleteProfilesResult, videoCounts, contactCounts, validationCountByAthlete] =
    await Promise.all([
      supabase
        .from("profile")
        .select("id, name, username, avatar_url, verified")
        .in("id", userIds),
      supabase
        .from("athlete_profile")
        .select("user_id, positions")
        .in("user_id", userIds),
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
      fetchApprovedValidationCountsByAthleteIds(userIds),
    ]);

  if (profilesResult.error) throw profilesResult.error;

  const posMap = new Map(
    (athleteProfilesResult.data ?? []).map((ap) => [ap.user_id, (ap.positions as string[]) ?? []])
  );
  const countByUser = (rows: { athlete_user_id: string }[] | null, id: string) =>
    (rows ?? []).filter((r) => r.athlete_user_id === id).length;

  return Promise.all(
    (profilesResult.data ?? []).map(async (p) => {
      const avatarUrl = await getSignedUrl(MEDIA_BUCKET, p.avatar_url);
      return {
        id: p.id,
        name: p.name ?? "",
        username: p.username ?? null,
        avatarUrl,
        verified: p.verified ?? false,
        positions: posMap.get(p.id) ?? [],
        videoCount: countByUser(videoCounts.data, p.id),
        validationCount: validationCountsMapGet(validationCountByAthlete, p.id),
        contactCount: countByUser(contactCounts.data, p.id),
        isShortlisted: false,
        validationStatus: statusByAthlete.get(p.id) ?? "pending",
      };
    })
  );
};
