-- App Store Guideline 1.2 (UGC): lets a user block an abusive account (hides
-- their content instantly) and report objectionable content/users for the
-- developer to review and act on within 24h.

CREATE TABLE IF NOT EXISTS public.user_block (
  blocker_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profile(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT user_block_not_self CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS user_block_blocker_idx ON public.user_block (blocker_id);

ALTER TABLE public.user_block ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_block_select_own" ON public.user_block
  FOR SELECT USING (blocker_id = auth.uid());

CREATE POLICY "user_block_insert_own" ON public.user_block
  FOR INSERT WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "user_block_delete_own" ON public.user_block
  FOR DELETE USING (blocker_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.content_report (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES public.profile(id) ON DELETE CASCADE,
  reported_user_id uuid NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE,
  media_id uuid REFERENCES public.media(id) ON DELETE SET NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_report_reason_check CHECK (
    reason IN ('spam', 'nudity_or_violence', 'harassment_or_bullying', 'fake_profile', 'other')
  ),
  CONSTRAINT content_report_status_check CHECK (status IN ('open', 'reviewed', 'actioned'))
);

CREATE INDEX IF NOT EXISTS content_report_status_idx ON public.content_report (status);

ALTER TABLE public.content_report ENABLE ROW LEVEL SECURITY;

-- Reporters can see their own submitted reports (e.g. to show "already reported").
-- Review/triage of all reports happens via the Supabase dashboard (service role
-- bypasses RLS), per the 24h moderation process required by App Store guideline 1.2.
CREATE POLICY "content_report_select_own" ON public.content_report
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "content_report_insert_own" ON public.content_report
  FOR INSERT WITH CHECK (reporter_id = auth.uid());
