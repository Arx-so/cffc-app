-- Approved validation counts visible for search/shortlists (no checklist rows exposed).
CREATE OR REPLACE FUNCTION public.cffc_public_approved_validation_counts(p_athlete_ids uuid[])
RETURNS TABLE (athlete_user_id uuid, approved_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.athlete_user_id,
         COUNT(*)::bigint AS approved_count
  FROM public.validation v
  WHERE v.athlete_user_id = ANY(p_athlete_ids)
    AND v.status = 'approved'::validation_status
  GROUP BY v.athlete_user_id;
$$;

REVOKE ALL ON FUNCTION public.cffc_public_approved_validation_counts(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cffc_public_approved_validation_counts(uuid[]) TO authenticated;
COMMENT ON FUNCTION public.cffc_public_approved_validation_counts(uuid[]) IS 'Returns approved validation counts per athlete for search/shortlists; does not expose checklist rows.';
