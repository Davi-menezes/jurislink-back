-- Sync auth.users <-> public.profiles for login validations.
-- This migration fixes lookups by email and email_verified used by auth screens.

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

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON public.profiles (email);

CREATE OR REPLACE FUNCTION public.sync_profile_from_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    role,
    lgpd_accepted,
    email,
    email_verified
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'CLIENT'),
    COALESCE((NEW.raw_user_meta_data ->> 'lgpd_accepted')::boolean, false),
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    role = COALESCE(EXCLUDED.role, public.profiles.role),
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile_sync ON auth.users;
CREATE TRIGGER on_auth_user_created_profile_sync
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_from_auth_user();

DROP TRIGGER IF EXISTS on_auth_user_updated_profile_sync ON auth.users;
CREATE TRIGGER on_auth_user_updated_profile_sync
  AFTER UPDATE OF email, email_confirmed_at, raw_user_meta_data ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_from_auth_user();

UPDATE public.profiles p
SET
  email = u.email,
  email_verified = (u.email_confirmed_at IS NOT NULL),
  updated_at = now()
FROM auth.users u
WHERE p.id = u.id
  AND (
    p.email IS DISTINCT FROM u.email
    OR p.email_verified IS DISTINCT FROM (u.email_confirmed_at IS NOT NULL)
  );
