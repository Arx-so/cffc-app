-- Pro/club avatar uploads failed: INSERT on storage.objects for bucket `media`
-- was allowed only for role athlete (policy media_bucket_insert_athlete).
CREATE POLICY "media_bucket_insert_pro_club_avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND is_current_user_not_banned()
  AND current_user_role() IN ('pro'::user_role, 'club'::user_role)
  AND name LIKE ('avatar_url/' || auth.uid()::text || '.%')
);
