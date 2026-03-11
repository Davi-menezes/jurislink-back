-- Custom application auth for JurisLink.
-- This migration creates a first-class public.users table and re-links profiles to it,
-- preserving existing ids from auth.users where possible.

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'LAWYER', 'ADMIN')),
  full_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'CREATED' CHECK (status IN ('CREATED', 'VERIFIED', 'PREMIUM')),
  is_email_verified BOOLEAN NOT NULL DEFAULT false,
  google_id TEXT UNIQUE,
  email_verification_token TEXT,
  email_verification_expires TIMESTAMPTZ,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMPTZ,
  legacy_auth_user_id UUID UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON public.users (google_id);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON public.users (email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_password_reset_token ON public.users (password_reset_token);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON public.profiles (email);

INSERT INTO public.users (
  id,
  email,
  role,
  full_name,
  status,
  is_email_verified,
  legacy_auth_user_id
)
SELECT
  au.id,
  au.email,
  COALESCE(p.role, au.raw_user_meta_data ->> 'role', 'CLIENT'),
  COALESCE(NULLIF(p.full_name, ''), au.raw_user_meta_data ->> 'full_name', split_part(au.email, '@', 1)),
  CASE
    WHEN au.email_confirmed_at IS NOT NULL THEN 'VERIFIED'
    ELSE 'CREATED'
  END,
  au.email_confirmed_at IS NOT NULL,
  au.id
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE au.email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.users.full_name),
  status = CASE
    WHEN EXCLUDED.is_email_verified THEN 'VERIFIED'
    ELSE public.users.status
  END,
  is_email_verified = EXCLUDED.is_email_verified,
  legacy_auth_user_id = EXCLUDED.legacy_auth_user_id,
  updated_at = now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND constraint_name = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES public.users(id) ON DELETE CASCADE;

UPDATE public.profiles p
SET
  email = u.email,
  email_verified = u.is_email_verified,
  role = u.role,
  full_name = COALESCE(NULLIF(u.full_name, ''), p.full_name),
  updated_at = now()
FROM public.users u
WHERE p.id = u.id;

CREATE OR REPLACE FUNCTION public.sync_profile_from_public_user()
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
    email,
    email_verified
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.full_name, ''),
    COALESCE(NEW.role, 'CLIENT'),
    NEW.email,
    NEW.is_email_verified
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

DROP TRIGGER IF EXISTS users_profile_sync ON public.users;
CREATE TRIGGER users_profile_sync
  AFTER INSERT OR UPDATE OF email, is_email_verified, full_name, role
  ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_from_public_user();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile_sync ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated_profile_sync ON auth.users;
