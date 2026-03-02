-- JurisLink Core Tables

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'LAWYER', 'ADMIN')),
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  state TEXT,
  city TEXT,
  phone TEXT,
  lgpd_accepted BOOLEAN NOT NULL DEFAULT false,
  lgpd_accepted_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Legal Areas table
CREATE TABLE IF NOT EXISTS public.legal_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT
);

ALTER TABLE public.legal_areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "legal_areas_select_all" ON public.legal_areas FOR SELECT USING (true);

-- Lawyer Profiles table
CREATE TABLE IF NOT EXISTS public.lawyer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  oab_number TEXT NOT NULL,
  oab_state TEXT NOT NULL,
  area_id UUID REFERENCES public.legal_areas(id),
  secondary_area_id UUID REFERENCES public.legal_areas(id),
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  serves_entire_state BOOLEAN NOT NULL DEFAULT false,
  description TEXT NOT NULL DEFAULT '',
  years_experience INTEGER NOT NULL DEFAULT 0,
  verification_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  subscription_status TEXT NOT NULL DEFAULT 'INACTIVE' CHECK (subscription_status IN ('ACTIVE', 'INACTIVE', 'CANCELLED')),
  boost_until TIMESTAMPTZ,
  rating_avg NUMERIC(2,1) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  slug TEXT UNIQUE,
  phone TEXT,
  website TEXT,
  linkedin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lawyer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lawyer_profiles_select_all" ON public.lawyer_profiles FOR SELECT USING (true);
CREATE POLICY "lawyer_profiles_insert_own" ON public.lawyer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "lawyer_profiles_update_own" ON public.lawyer_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES public.lawyer_profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL DEFAULT '',
  lawyer_response TEXT,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lawyer_id, client_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_visible" ON public.reviews FOR SELECT USING (is_hidden = false OR auth.uid() = client_id);
CREATE POLICY "reviews_insert_clients" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE USING (auth.uid() = client_id);

-- Favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lawyer_id UUID NOT NULL REFERENCES public.lawyer_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, lawyer_id)
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "favorites_select_own" ON public.favorites FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "favorites_insert_own" ON public.favorites FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "favorites_delete_own" ON public.favorites FOR DELETE USING (auth.uid() = client_id);

-- Contacts (leads) table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES public.lawyer_profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_insert_all" ON public.contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "contacts_select_lawyer" ON public.contacts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lawyer_profiles lp WHERE lp.id = lawyer_id AND lp.user_id = auth.uid()
  )
);
CREATE POLICY "contacts_update_lawyer" ON public.contacts FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.lawyer_profiles lp WHERE lp.id = lawyer_id AND lp.user_id = auth.uid()
  )
);

-- Payments table (stub for Mercado Pago integration)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lawyer_id UUID NOT NULL REFERENCES public.lawyer_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('SUBSCRIPTION', 'BOOST')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
  amount_cents INTEGER NOT NULL DEFAULT 0,
  external_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_select_own" ON public.payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lawyer_profiles lp WHERE lp.id = lawyer_id AND lp.user_id = auth.uid()
  )
);
