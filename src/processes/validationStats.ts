import { supabase } from "@/config/supabase";

type RpcApprovedRow = { athlete_user_id: string; approved_count: number | string };

/** Single canonical key for Map lookups — avoids RPC vs profile id casing mismatches. */
function athleteIdMapKey(id: string): string {
  return String(id).trim().toLowerCase();
}

/** Use when reading counts from maps built by fetch*ValidationCountsByAthleteIds. */
export function validationCountsMapGet(map: Map<string, number>, athleteId: string): number {
  return map.get(athleteIdMapKey(athleteId)) ?? 0;
}

/**
 * Approved-only counts — matches profile/header stats (`status = approved`).
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

  for (const raw of (data ?? []) as RpcApprovedRow[]) {
    map.set(athleteIdMapKey(String(raw.athlete_user_id)), Number(raw.approved_count));
  }
  return map;
}

// Pending+approved discovery counts live in RPC `cffc_public_discovery_validation_counts`
// if we ever want scouts to see not-yet-moderated activity on cards again.
