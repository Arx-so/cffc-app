-- Pending + approved counts for explorer / shortlists (rejections excluded).
CREATE OR REPLACE FUNCTION public.cffc_public_discovery_validation_counts(p_athlete_ids uuid[])
RETURNS TABLE (athlete_user_id uuid, discovery_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.athlete_user_id,
         COUNT(*)::bigint AS discovery_count
  FROM public.validation v
  WHERE v.athlete_user_id = ANY(p_athlete_ids)
    AND v.status IN (
      'pending'::validation_status,
      'approved'::validation_status
    )
  GROUP BY v.athlete_user_id;
$$;

REVOKE ALL ON FUNCTION public.cffc_public_discovery_validation_counts(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cffc_public_discovery_validation_counts(uuid[]) TO authenticated;
COMMENT ON FUNCTION public.cffc_public_discovery_validation_counts(uuid[]) IS 'Pending+approved validation counts for search cards (excludes rejected).';
