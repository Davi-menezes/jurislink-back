-- Performance indexes for JurisLink

CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_area ON public.lawyer_profiles(area_id);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_state_city ON public.lawyer_profiles(state, city);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_rating ON public.lawyer_profiles(rating_avg DESC);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_subscription ON public.lawyer_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_verification ON public.lawyer_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_slug ON public.lawyer_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_lawyer_profiles_boost ON public.lawyer_profiles(boost_until);
CREATE INDEX IF NOT EXISTS idx_reviews_lawyer ON public.reviews(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client ON public.reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_favorites_client ON public.favorites(client_id);
CREATE INDEX IF NOT EXISTS idx_favorites_lawyer ON public.favorites(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_contacts_lawyer ON public.contacts(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_payments_lawyer ON public.payments(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
