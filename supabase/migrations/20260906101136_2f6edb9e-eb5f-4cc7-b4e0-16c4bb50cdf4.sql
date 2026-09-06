ALTER TABLE public.family_progress
  ADD COLUMN IF NOT EXISTS track_nafs integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS track_tawba integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS track_sunan integer NOT NULL DEFAULT 0;