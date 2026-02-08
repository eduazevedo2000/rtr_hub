-- Create championship_standings table
CREATE TABLE IF NOT EXISTS public.championship_standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class TEXT NOT NULL CHECK (class IN ('LMP2', 'GT3 PRO')),
  rank INTEGER NOT NULL,
  car_number TEXT NOT NULL,
  car_logo_url TEXT,
  country_code TEXT NOT NULL,
  team_name TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  behind INTEGER NOT NULL DEFAULT 0,
  starts INTEGER NOT NULL DEFAULT 0,
  poles INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  top5 INTEGER NOT NULL DEFAULT 0,
  top10 INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_standings_class ON public.championship_standings(class);
CREATE INDEX IF NOT EXISTS idx_standings_rank ON public.championship_standings(rank);
CREATE INDEX IF NOT EXISTS idx_standings_class_rank ON public.championship_standings(class, rank);

-- Add comments
COMMENT ON TABLE public.championship_standings IS 'Championship standings for LMP2 and GT3 PRO classes';
COMMENT ON COLUMN public.championship_standings.class IS 'Racing class: LMP2 or GT3 PRO';
COMMENT ON COLUMN public.championship_standings.rank IS 'Current position in standings';
COMMENT ON COLUMN public.championship_standings.car_number IS 'Car number displayed on vehicle';
COMMENT ON COLUMN public.championship_standings.car_logo_url IS 'URL to car/team logo image';
COMMENT ON COLUMN public.championship_standings.country_code IS 'ISO 3166-1 alpha-2 country code (e.g., PT, US, DE)';
COMMENT ON COLUMN public.championship_standings.team_name IS 'Team name';
COMMENT ON COLUMN public.championship_standings.points IS 'Total championship points';
COMMENT ON COLUMN public.championship_standings.behind IS 'Points behind leader';
COMMENT ON COLUMN public.championship_standings.starts IS 'Number of race starts';
COMMENT ON COLUMN public.championship_standings.poles IS 'Number of pole positions';
COMMENT ON COLUMN public.championship_standings.wins IS 'Number of race wins';
COMMENT ON COLUMN public.championship_standings.top5 IS 'Number of top 5 finishes';
COMMENT ON COLUMN public.championship_standings.top10 IS 'Number of top 10 finishes';

-- Enable Row Level Security
ALTER TABLE public.championship_standings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read standings
CREATE POLICY "Public read access to championship standings"
  ON public.championship_standings
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert
CREATE POLICY "Authenticated users can insert championship standings"
  ON public.championship_standings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update
CREATE POLICY "Authenticated users can update championship standings"
  ON public.championship_standings
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Authenticated users can delete
CREATE POLICY "Authenticated users can delete championship standings"
  ON public.championship_standings
  FOR DELETE
  TO authenticated
  USING (true);
