-- =============================================
-- Create profiles table for user data
-- =============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Create verification_codes table for OTP
-- =============================================

CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + interval '10 minutes',
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Allow inserts from anon key (for API route)
CREATE POLICY "Anyone can insert verification_codes"
  ON public.verification_codes FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read verification_codes (for API route)
CREATE POLICY "Anyone can read verification_codes"
  ON public.verification_codes FOR SELECT
  USING (true);

-- Allow anyone to update verification_codes
CREATE POLICY "Anyone can update verification_codes"
  ON public.verification_codes FOR UPDATE
  USING (true);

-- Auto-clean expired codes (runs hourly)
SELECT cron.schedule(
  'clean-expired-codes',
  '0 * * * *',
  $$DELETE FROM public.verification_codes WHERE expires_at < now() OR used = true$$
);
-- Note: if pg_cron is not available, ignore the cron.schedule error
