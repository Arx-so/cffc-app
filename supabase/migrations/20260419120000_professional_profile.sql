-- Extension table for professional credentials (role = pro).
-- Mirrors athlete_profile pattern: sync on role change + RPC for client cleanup.

CREATE TABLE IF NOT EXISTS public.professional_profile (
  user_id uuid PRIMARY KEY REFERENCES public.profile (id) ON DELETE CASCADE,
  specialty text,
  registration_number text,
  institution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.professional_profile IS 'Credenciais do profissional (especialidade, registro, instituição).';

DELETE FROM public.professional_profile AS pp
USING public.profile AS p
WHERE pp.user_id = p.id
  AND lower(trim(p.role::text)) IS DISTINCT FROM 'pro';

INSERT INTO public.professional_profile (user_id)
SELECT id FROM public.profile WHERE lower(trim(role::text)) = 'pro'
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.cffc_professional_profile_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_cffc_professional_profile_updated_at ON public.professional_profile;

CREATE TRIGGER tr_cffc_professional_profile_updated_at
BEFORE UPDATE ON public.professional_profile
FOR EACH ROW
EXECUTE FUNCTION public.cffc_professional_profile_set_updated_at();

-- Block inserts when profile.role is not pro (runs as SECURITY DEFINER so it can read profile under RLS).
CREATE OR REPLACE FUNCTION public.cffc_professional_profile_only_pro_before_insert()
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

  IF r IS DISTINCT FROM 'pro' THEN
    RETURN NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_cffc_professional_profile_only_pro ON public.professional_profile;

CREATE TRIGGER tr_cffc_professional_profile_only_pro
BEFORE INSERT ON public.professional_profile
FOR EACH ROW
EXECUTE FUNCTION public.cffc_professional_profile_only_pro_before_insert();

CREATE OR REPLACE FUNCTION public.cffc_profile_role_sync_professional_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(trim(NEW.role::text)) = 'pro' THEN
    INSERT INTO public.professional_profile (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    DELETE FROM public.professional_profile WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_cffc_profile_role_sync_professional_profile ON public.profile;

CREATE TRIGGER tr_cffc_profile_role_sync_professional_profile
AFTER INSERT OR UPDATE OF role ON public.profile
FOR EACH ROW
EXECUTE FUNCTION public.cffc_profile_role_sync_professional_profile();

CREATE OR REPLACE FUNCTION public.cffc_sync_professional_profile_for_role(
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

  IF lower(trim(coalesce(p_role, ''))) = 'pro' THEN
    INSERT INTO public.professional_profile (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    DELETE FROM public.professional_profile WHERE user_id = p_user_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.cffc_sync_professional_profile_for_role(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cffc_sync_professional_profile_for_role(uuid, text) TO authenticated;

ALTER TABLE public.professional_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY professional_profile_select_own
  ON public.professional_profile
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY professional_profile_insert_own_pro
  ON public.professional_profile
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profile AS p
      WHERE p.id = user_id AND lower(trim(p.role::text)) = 'pro'
    )
  );

CREATE POLICY professional_profile_update_own
  ON public.professional_profile
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY professional_profile_delete_own
  ON public.professional_profile
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
