import { supabase } from "@/config/supabase";
import { ReportContentBody } from "./types/moderationTypes";

export const fetchBlockedUserIds = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("user_block").select("blocked_id");
  if (error) throw error;
  return (data ?? []).map((row) => row.blocked_id as string);
};

export const blockUser = async (blockedUserId: string): Promise<void> => {
  const { error } = await supabase
    .from("user_block")
    .insert({ blocked_id: blockedUserId });
  if (error) throw error;
};

export const reportContent = async (body: ReportContentBody): Promise<void> => {
  const { error } = await supabase.from("content_report").insert({
    reported_user_id: body.reportedUserId,
    media_id: body.mediaId ?? null,
    reason: body.reason,
  });
  if (error) throw error;
};
