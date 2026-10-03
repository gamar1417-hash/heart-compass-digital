CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT 'عضو جديد',
  avatar_url text,
  bio text NOT NULL DEFAULT '',
  interests text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Members update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Members delete own profile" ON public.profiles FOR DELETE TO authenticated USING (id = auth.uid());

CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT friendships_distinct_members CHECK (sender_id <> receiver_id),
  CONSTRAINT friendships_unique_pair UNIQUE (sender_id, receiver_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parties view friendships" ON public.friendships FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Members send requests" ON public.friendships FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND status = 'pending');
CREATE POLICY "Receivers accept requests" ON public.friendships FOR UPDATE TO authenticated USING (auth.uid() = receiver_id AND status = 'pending') WITH CHECK (auth.uid() = receiver_id AND status = 'accepted');
CREATE POLICY "Parties remove friendships" ON public.friendships FOR DELETE TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL,
  category text NOT NULL CHECK (category IN ('faith', 'character', 'lesson', 'reminder', 'paradise')),
  body text NOT NULL CHECK (char_length(body) BETWEEN 3 AND 3000),
  linked_path text,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT ALL ON public.community_posts TO service_role;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view active posts" ON public.community_posts FOR SELECT TO authenticated USING (is_deleted = false OR author_id = auth.uid());
CREATE POLICY "Members create posts" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid() AND is_deleted = false);
CREATE POLICY "Authors update posts" ON public.community_posts FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors delete posts" ON public.community_posts FOR DELETE TO authenticated USING (author_id = auth.uid());

CREATE TABLE public.community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_comments TO authenticated;
GRANT ALL ON public.community_comments TO service_role;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view active comments" ON public.community_comments FOR SELECT TO authenticated USING (is_deleted = false OR author_id = auth.uid());
CREATE POLICY "Members create comments" ON public.community_comments FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid() AND is_deleted = false);
CREATE POLICY "Authors update comments" ON public.community_comments FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "Authors delete comments" ON public.community_comments FOR DELETE TO authenticated USING (author_id = auth.uid());

CREATE TABLE public.community_likes (
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.community_likes TO authenticated;
GRANT ALL ON public.community_likes TO service_role;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view likes" ON public.community_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members like posts" ON public.community_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Members remove own likes" ON public.community_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.community_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES public.community_comments(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('inappropriate', 'misinformation', 'harassment', 'other')),
  details text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT community_reports_one_target CHECK ((post_id IS NOT NULL)::int + (comment_id IS NOT NULL)::int = 1)
);
GRANT SELECT, INSERT ON public.community_reports TO authenticated;
GRANT ALL ON public.community_reports TO service_role;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members view own reports" ON public.community_reports FOR SELECT TO authenticated USING (reporter_id = auth.uid());
CREATE POLICY "Members create reports" ON public.community_reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
CREATE UNIQUE INDEX community_reports_unique_post ON public.community_reports (reporter_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX community_reports_unique_comment ON public.community_reports (reporter_id, comment_id) WHERE comment_id IS NOT NULL;

CREATE INDEX profiles_display_name_idx ON public.profiles (display_name);
CREATE INDEX friendships_sender_idx ON public.friendships (sender_id, status);
CREATE INDEX friendships_receiver_idx ON public.friendships (receiver_id, status);
CREATE INDEX community_posts_created_idx ON public.community_posts (created_at DESC) WHERE is_deleted = false;
CREATE INDEX community_comments_post_idx ON public.community_comments (post_id, created_at) WHERE is_deleted = false;
CREATE INDEX community_likes_post_idx ON public.community_likes (post_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON public.friendships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_community_comments_updated_at BEFORE UPDATE ON public.community_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();