
-- Privacy settings table
CREATE TABLE public.privacy_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_visibility text NOT NULL DEFAULT 'everyone',
  allowed_types text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own privacy" ON public.privacy_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own privacy" ON public.privacy_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own privacy" ON public.privacy_settings FOR UPDATE USING (auth.uid() = user_id);

-- Blocks table
CREATE TABLE public.blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own blocks" ON public.blocks FOR SELECT USING (auth.uid() = blocker_id);
CREATE POLICY "Users can insert own blocks" ON public.blocks FOR INSERT WITH CHECK (auth.uid() = blocker_id);
CREATE POLICY "Users can delete own blocks" ON public.blocks FOR DELETE USING (auth.uid() = blocker_id);

-- User photos table (for future photo visibility)
CREATE TABLE public.user_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own photos" ON public.user_photos FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own photos" ON public.user_photos FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can delete own photos" ON public.user_photos FOR DELETE USING (auth.uid() = owner_id);

-- Photo visibility table
CREATE TABLE public.profile_photo_visibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_id uuid NOT NULL REFERENCES public.user_photos(id) ON DELETE CASCADE,
  is_visible boolean NOT NULL DEFAULT true,
  UNIQUE(owner_id, photo_id)
);
ALTER TABLE public.profile_photo_visibility ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own photo visibility" ON public.profile_photo_visibility FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own photo visibility" ON public.profile_photo_visibility FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own photo visibility" ON public.profile_photo_visibility FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own photo visibility" ON public.profile_photo_visibility FOR DELETE USING (auth.uid() = owner_id);

-- Add phone fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false;
