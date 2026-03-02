-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, state, city, lgpd_accepted)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'CLIENT'),
    COALESCE(NEW.raw_user_meta_data ->> 'state', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'city', NULL),
    COALESCE((NEW.raw_user_meta_data ->> 'lgpd_accepted')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Recalculate rating average after review changes
CREATE OR REPLACE FUNCTION public.recalculate_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_lawyer_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_lawyer_id := OLD.lawyer_id;
  ELSE
    target_lawyer_id := NEW.lawyer_id;
  END IF;

  UPDATE public.lawyer_profiles
  SET
    rating_avg = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM public.reviews
      WHERE lawyer_id = target_lawyer_id AND is_hidden = false
    ), 0),
    rating_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE lawyer_id = target_lawyer_id AND is_hidden = false
    ),
    updated_at = now()
  WHERE id = target_lawyer_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_review_change ON public.reviews;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_rating();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS lawyer_profiles_updated_at ON public.lawyer_profiles;
CREATE TRIGGER lawyer_profiles_updated_at
  BEFORE UPDATE ON public.lawyer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS reviews_updated_at ON public.reviews;
CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Generate slug for lawyer profile
CREATE OR REPLACE FUNCTION public.generate_lawyer_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
  profile_name TEXT;
BEGIN
  SELECT full_name INTO profile_name FROM public.profiles WHERE id = NEW.user_id;
  
  base_slug := LOWER(REGEXP_REPLACE(
    TRANSLATE(
      COALESCE(profile_name, 'advogado'),
      'áàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ',
      'aaaaeeeiiioooouuucAAAAEEEIIIOOOOUUUC'
    ),
    '[^a-z0-9]+', '-', 'g'
  ));
  
  base_slug := base_slug || '-' || LOWER(NEW.oab_state);
  final_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM public.lawyer_profiles WHERE slug = final_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  NEW.slug := final_slug;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lawyer_slug_generation ON public.lawyer_profiles;
CREATE TRIGGER lawyer_slug_generation
  BEFORE INSERT OR UPDATE OF user_id ON public.lawyer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_lawyer_slug();
