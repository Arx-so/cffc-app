-- Pontuação de reputação do profissional (ex.: escala 0–5); definida pelo admin ou job.
ALTER TABLE public.professional_profile
ADD COLUMN IF NOT EXISTS reputation_score numeric(4,2);

COMMENT ON COLUMN public.professional_profile.reputation_score IS 'Pontuação de reputação do profissional (ex.: 0–5).';

ALTER TABLE public.professional_profile
DROP CONSTRAINT IF EXISTS professional_profile_reputation_score_range;

ALTER TABLE public.professional_profile
ADD CONSTRAINT professional_profile_reputation_score_range
CHECK (
  reputation_score IS NULL
  OR (reputation_score >= 0 AND reputation_score <= 5)
);
