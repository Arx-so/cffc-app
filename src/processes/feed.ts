import { supabase } from "@/config/supabase";
import { fetchBlockedUserIds } from "@/processes/moderation";
import { getSignedUrl } from "@/utils/supabaseStorage";
import { FeedVideo } from "./types/feedTypes";

const MEDIA_BUCKET = "media";
const FEED_PAGE_SIZE = 50;

export const fetchVideoFeed = async (): Promise<FeedVideo[]> => {
  const [{ data, error }, blockedUserIds] = await Promise.all([
    supabase
      .from("media")
      .select(
        "id, athlete_user_id, title, url, created_at, athlete:profile!media_athlete_user_id_fkey(username)"
      )
      .eq("type", "video")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(FEED_PAGE_SIZE),
    fetchBlockedUserIds().catch(() => []),
  ]);

  if (error) throw error;

  const blockedSet = new Set(blockedUserIds);
  const rows = (data ?? []).filter(
    (item) => !blockedSet.has(item.athlete_user_id)
  );

  const signedRows = await Promise.all(
    rows.map(async (item) => {
      const signedUrl = await getSignedUrl(MEDIA_BUCKET, item.url);
      const athleteRecord = (
        item as {
          athlete?:
            | {
                username: string | null;
              }
            | Array<{
                username: string | null;
              }>
            | null;
        }
      ).athlete;

      return {
        id: item.id,
        athleteUserId: item.athlete_user_id,
        username:
          athleteRecord && !Array.isArray(athleteRecord)
            ? athleteRecord.username
            : null,
        title: item.title,
        url: signedUrl ?? item.url,
        createdAt: item.created_at,
      } satisfies FeedVideo;
    })
  );

  return signedRows;
};

export const fetchUserVideoFeed = async (userId: string): Promise<FeedVideo[]> => {
  const { data, error } = await supabase
    .from("media")
    .select(
      "id, athlete_user_id, title, url, created_at, athlete:profile!media_athlete_user_id_fkey(username)"
    )
    .eq("type", "video")
    .eq("status", "approved")
    .eq("athlete_user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const rows = data ?? [];

  const signedRows = await Promise.all(
    rows.map(async (item) => {
      const signedUrl = await getSignedUrl(MEDIA_BUCKET, item.url);
      const athleteRecord = (
        item as {
          athlete?:
            | {
                username: string | null;
              }
            | Array<{
                username: string | null;
              }>
            | null;
        }
      ).athlete;

      return {
        id: item.id,
        athleteUserId: item.athlete_user_id,
        username:
          athleteRecord && !Array.isArray(athleteRecord)
            ? athleteRecord.username
            : null,
        title: item.title,
        url: signedUrl ?? item.url,
        createdAt: item.created_at,
      } satisfies FeedVideo;
    })
  );

  return signedRows;
};
