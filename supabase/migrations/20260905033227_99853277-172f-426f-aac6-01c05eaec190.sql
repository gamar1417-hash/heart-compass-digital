REVOKE ALL ON FUNCTION public.is_family_member(uuid, uuid) FROM PUBLIC, anon, authenticated;

DROP FUNCTION IF EXISTS public.family_id_by_code(text);

CREATE OR REPLACE FUNCTION public.join_family_by_code(_code text, _display_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE fid uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;
  SELECT id INTO fid FROM public.families WHERE join_code = upper(trim(_code)) LIMIT 1;
  IF fid IS NULL THEN
    RAISE EXCEPTION 'invalid code';
  END IF;
  INSERT INTO public.family_members (family_id, user_id, display_name, role)
  VALUES (fid, auth.uid(), COALESCE(NULLIF(trim(_display_name), ''), 'فرد من العائلة'), 'member')
  ON CONFLICT (family_id, user_id) DO UPDATE SET display_name = EXCLUDED.display_name;
  RETURN fid;
END;
$$;

REVOKE ALL ON FUNCTION public.join_family_by_code(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_family_by_code(text, text) TO authenticated;