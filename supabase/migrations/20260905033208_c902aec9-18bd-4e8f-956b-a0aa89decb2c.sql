CREATE TABLE public.families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  join_code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,6)),
  owner_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  display_name text NOT NULL DEFAULT 'فرد من العائلة',
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (family_id, user_id)
);

CREATE TABLE public.family_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  display_name text NOT NULL DEFAULT 'فرد من العائلة',
  lifetime_total integer NOT NULL DEFAULT 0,
  today_total integer NOT NULL DEFAULT 0,
  stage integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (family_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.families TO authenticated;
GRANT ALL ON public.families TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_members TO authenticated;
GRANT ALL ON public.family_members TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_progress TO authenticated;
GRANT ALL ON public.family_progress TO service_role;

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_progress ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_family_member(_family_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = _family_id AND user_id = _user_id
  )
$$;

CREATE OR REPLACE FUNCTION public.family_id_by_code(_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.families WHERE join_code = upper(_code) LIMIT 1
$$;

CREATE POLICY "Members can view their family"
ON public.families FOR SELECT TO authenticated
USING (public.is_family_member(id, auth.uid()) OR owner_id = auth.uid());

CREATE POLICY "Users can create a family"
ON public.families FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner can update family"
ON public.families FOR UPDATE TO authenticated
USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner can delete family"
ON public.families FOR DELETE TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Members can view family members"
ON public.family_members FOR SELECT TO authenticated
USING (public.is_family_member(family_id, auth.uid()));

CREATE POLICY "Users can join a family themselves"
ON public.family_members FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own membership"
ON public.family_members FOR UPDATE TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Leave or owner removes member"
ON public.family_members FOR DELETE TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.families f WHERE f.id = family_id AND f.owner_id = auth.uid())
);

CREATE POLICY "Members can view family progress"
ON public.family_progress FOR SELECT TO authenticated
USING (public.is_family_member(family_id, auth.uid()));

CREATE POLICY "Members insert their own progress"
ON public.family_progress FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND public.is_family_member(family_id, auth.uid()));

CREATE POLICY "Members update their own progress"
ON public.family_progress FOR UPDATE TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members delete their own progress"
ON public.family_progress FOR DELETE TO authenticated
USING (user_id = auth.uid());

CREATE TRIGGER update_families_updated_at BEFORE UPDATE ON public.families
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON public.family_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_family_progress_updated_at BEFORE UPDATE ON public.family_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();