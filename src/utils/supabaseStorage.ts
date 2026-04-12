import { supabase } from "@/config/supabase";

const SIGNED_URL_EXPIRY_SECONDS = 60 * 60; // 1 hour

/**
 * Returns a signed URL for a file in a PRIVATE Supabase Storage bucket.
 * Returns null if path is null/empty or if signing fails (e.g. file doesn't exist).
 */
export const getSignedUrl = async (
  bucket: string,
  path: string | null | undefined
): Promise<string | null> => {
  if (!path) return null;

  const cleanPath = path.trim();
  if (!cleanPath) return null;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(cleanPath, SIGNED_URL_EXPIRY_SECONDS);

  if (error || !data?.signedUrl) {
    console.warn(`[supabaseStorage] createSignedUrl failed for ${bucket}/${cleanPath}:`, error?.message);
    return null;
  }

  return data.signedUrl;
};
