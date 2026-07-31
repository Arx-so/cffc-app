-- Self-service account deletion (Google Play / App Store account-deletion requirement).
-- Removes the caller's rows across all app tables, their storage objects, and their auth user.
CREATE OR REPLACE FUNCTION public.cffc_delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  DELETE FROM public.club_shortlist WHERE club_user_id = v_uid OR athlete_user_id = v_uid;
  DELETE FROM public.contact_request WHERE athlete_user_id = v_uid;
  DELETE FROM public.validation WHERE athlete_user_id = v_uid OR professional_user_id = v_uid;
  DELETE FROM public.professional_document WHERE profile_id = v_uid;
  DELETE FROM public.media WHERE athlete_user_id = v_uid;
  DELETE FROM public.athlete_profile WHERE user_id = v_uid;
  DELETE FROM public.professional_profile WHERE user_id = v_uid;

  DELETE FROM storage.objects
  WHERE bucket_id = 'media'
    AND (
      name LIKE 'avatar_url/' || v_uid::text || '.%'
      OR name LIKE 'url/' || v_uid::text || '/%'
      OR name LIKE 'thumb_url/' || v_uid::text || '/%'
    );

  DELETE FROM storage.objects
  WHERE bucket_id = 'professional-documents'
    AND name LIKE 'professional_document/' || v_uid::text || '/%';

  DELETE FROM public.profile WHERE id = v_uid;
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.cffc_delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cffc_delete_own_account() TO authenticated;
COMMENT ON FUNCTION public.cffc_delete_own_account() IS 'Deletes all app data, storage objects, and the auth user for the calling account (self-service account deletion).';
