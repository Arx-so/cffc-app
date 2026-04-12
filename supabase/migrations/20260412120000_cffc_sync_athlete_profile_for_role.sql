-- Keeps athlete_profile aligned with account role.
-- Run via Supabase CLI or paste the full file into Supabase Dashboard → SQL → Run.
--
-- 1) Drops the old trigger that blindly inserted into athlete_profile for every new profile.
-- 2) BEFORE INSERT: blocks creating athlete_profile rows for non-athletes.
--    Runs as SECURITY DEFINER so it can read profile even with RLS.
-- 3) RPC: used by the app when the session exists (optional extra cleanup).

-- One-time cleanup for rows created before this migration
DELETE FROM public.athlete_profile AS ap
USING public.profile AS p
WHERE ap.user_id = p.id
  AND lower(trim(p.role::text)) IS DISTINCT FROM 'athlete';

-- Drop the old trigger that blindly inserts into athlete_profile for every new profile
DROP TRIGGER IF EXISTS trg_ensure_athlete_profile_on_profile_insert ON public.profile;
DROP FUNCTION IF EXISTS public.ensure_athlete_profile_on_profile_insert();

-- Prevent INSERT into athlete_profile unless profile.role is athlete (no row created for pro/club/admin)
CREATE OR REPLACE FUNCTION public.cffc_athlete_profile_only_athletes_before_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r text;
BEGIN
  SELECT lower(trim(p.role::text)) INTO r
  FROM public.profile AS p
  WHERE p.id = NEW.user_id;

  IF r IS DISTINCT FROM 'athlete' THEN
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_cffc_athlete_profile_only_athletes ON public.athlete_profile;

CREATE TRIGGER tr_cffc_athlete_profile_only_athletes
BEFORE INSERT ON public.athlete_profile
FOR EACH ROW
EXECUTE FUNCTION public.cffc_athlete_profile_only_athletes_before_insert();

-- If role changes away from athlete, drop the extension row
CREATE OR REPLACE FUNCTION public.cffc_profile_role_drop_athlete_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(trim(NEW.role::text)) IS DISTINCT FROM 'athlete' THEN
    DELETE FROM public.athlete_profile WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_cffc_profile_role_drop_athlete_profile ON public.profile;

CREATE TRIGGER tr_cffc_profile_role_drop_athlete_profile
AFTER INSERT OR UPDATE OF role ON public.profile
FOR EACH ROW
EXECUTE FUNCTION public.cffc_profile_role_drop_athlete_profile();

CREATE OR REPLACE FUNCTION public.cffc_sync_athlete_profile_for_role(
  p_user_id uuid,
  p_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  IF lower(trim(coalesce(p_role, ''))) = 'athlete' THEN
    INSERT INTO public.athlete_profile (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    DELETE FROM public.athlete_profile WHERE user_id = p_user_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.cffc_sync_athlete_profile_for_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cffc_sync_athlete_profile_for_role(uuid, text) TO authenticated;
