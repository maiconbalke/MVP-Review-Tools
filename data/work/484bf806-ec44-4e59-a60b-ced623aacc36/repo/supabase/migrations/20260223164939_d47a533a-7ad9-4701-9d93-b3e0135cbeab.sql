
-- 1) Comments table
CREATE TABLE public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  parent_id uuid REFERENCES public.post_comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_post_comments_post ON public.post_comments(post_id, created_at);
CREATE INDEX idx_post_comments_parent ON public.post_comments(parent_id, created_at);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments viewable by authenticated" ON public.post_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own comments" ON public.post_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.post_comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2) Comment mentions table
CREATE TABLE public.comment_mentions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES public.post_comments(id) ON DELETE CASCADE,
  mentioned_user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(comment_id, mentioned_user_id)
);

ALTER TABLE public.comment_mentions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mentions viewable by authenticated" ON public.comment_mentions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert mentions on own comments" ON public.comment_mentions
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.post_comments WHERE id = comment_id AND user_id = auth.uid())
  );

-- 3) Post media table (multiple images per post)
CREATE TABLE public.post_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  media_url text NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, position)
);

ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Post media viewable by authenticated" ON public.post_media
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own post media" ON public.post_media
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete own post media" ON public.post_media
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.posts WHERE id = post_id AND user_id = auth.uid())
  );

-- 4) Add comment_count to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS comment_count int NOT NULL DEFAULT 0;

-- 5) Trigger to auto-increment comment_count
CREATE OR REPLACE FUNCTION public.handle_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_count();

-- 6) Storage bucket for post images
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- 7) Storage RLS for post-images bucket
CREATE POLICY "Authenticated users can upload post images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Anyone can view post images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'post-images');

CREATE POLICY "Users can delete own post images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text);
