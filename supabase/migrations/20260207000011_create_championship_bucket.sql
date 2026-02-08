-- Create ChampionshipLogos storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('ChampionshipLogos', 'ChampionshipLogos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Enable Row Level Security on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Public read access to ChampionshipLogos
CREATE POLICY "Public Access to ChampionshipLogos"
ON storage.objects FOR SELECT
USING (bucket_id = 'ChampionshipLogos');

-- Policy: Authenticated users can upload to ChampionshipLogos
CREATE POLICY "Authenticated users can upload to ChampionshipLogos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ChampionshipLogos');

-- Policy: Authenticated users can update ChampionshipLogos
CREATE POLICY "Authenticated users can update ChampionshipLogos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ChampionshipLogos');

-- Policy: Authenticated users can delete from ChampionshipLogos
CREATE POLICY "Authenticated users can delete from ChampionshipLogos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ChampionshipLogos');
