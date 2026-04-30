import { supabase } from "@/config/supabase";
import type { ValidationChecklist } from "@/processes/types/profileTypes";

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
