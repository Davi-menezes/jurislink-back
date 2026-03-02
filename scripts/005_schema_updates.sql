-- Update lawyer_profiles table to add missing fields
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS oab_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS hourly_rate_min INTEGER;
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS hourly_rate_max INTEGER;
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS accepts_online BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS accepts_in_person BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS office_address TEXT;
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS office_lat NUMERIC(10,8);
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS office_lng NUMERIC(11,8);
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS total_views INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS response_time_hours INTEGER;
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS profile_completeness INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ;
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS boost_active BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.lawyer_profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;

-- Rename verification_status to align with is_approved
-- Keep both for backwards compatibility
UPDATE public.lawyer_profiles SET is_approved = true WHERE verification_status = 'VERIFIED';

-- Update subscription_status to set is_premium
UPDATE public.lawyer_profiles SET is_premium = true WHERE subscription_status = 'ACTIVE';

-- Lawyer legal areas junction table
CREATE TABLE IF NOT EXISTS public.lawyer_legal_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES public.lawyer_profiles(id) ON DELETE CASCADE,
  area_id UUID NOT NULL REFERENCES public.legal_areas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lawyer_id, area_id)
);

ALTER TABLE public.lawyer_legal_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lawyer_legal_areas_select_all" ON public.lawyer_legal_areas FOR SELECT USING (true);
CREATE POLICY "lawyer_legal_areas_insert_own" ON public.lawyer_legal_areas FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.lawyer_profiles lp WHERE lp.id = lawyer_id AND lp.user_id = auth.uid()
  )
);
CREATE POLICY "lawyer_legal_areas_delete_own" ON public.lawyer_legal_areas FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.lawyer_profiles lp WHERE lp.id = lawyer_id AND lp.user_id = auth.uid()
  )
);

-- Update legal_areas table
ALTER TABLE public.legal_areas ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Add title to reviews
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS lawyer_responded_at TIMESTAMPTZ;
