import { supabase } from "@/config/supabase";

type RpcCountRow = { athlete_user_id: string; approved_count: number | string };

/**
 * Approved validation counts per athlete. Uses SECURITY DEFINER RPC so scouts,
 * athletes, and clubs see the same totals as on the profile — not limited by RLS
 * that hides other users' validation rows from direct SELECT.
 */
export async function fetchApprovedValidationCountsByAthleteIds(
  athleteIds: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (athleteIds.length === 0) return map;

  const { data, error } = await supabase.rpc("cffc_public_approved_validation_counts", {
    p_athlete_ids: athleteIds,
  });

  if (error) throw error;

  for (const raw of (data ?? []) as RpcCountRow[]) {
    map.set(raw.athlete_user_id, Number(raw.approved_count));
  }
  return map;
}
