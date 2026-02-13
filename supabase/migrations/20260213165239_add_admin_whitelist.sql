-- =============================================
-- Create admin_users table for whitelist
-- =============================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admin_users table
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin_users (to prevent enumeration)
CREATE POLICY "Only admins can view admin_users"
  ON public.admin_users
  FOR SELECT
  USING (true); -- This will be updated after function is created

-- Explicitly deny INSERT/UPDATE/DELETE for authenticated users
-- Only service role can insert/update/delete admin_users
-- (This will be done manually via Supabase dashboard or service role)
CREATE POLICY "Deny insert for authenticated users"
  ON public.admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Deny update for authenticated users"
  ON public.admin_users
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Deny delete for authenticated users"
  ON public.admin_users
  FOR DELETE
  TO authenticated
  USING (false);

-- =============================================
-- Create helper function to check if user is admin
-- =============================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- Drop old policies and create new ones with admin check
-- =============================================

-- Drivers table
DROP POLICY IF EXISTS "Authenticated users can insert drivers" ON public.drivers;
DROP POLICY IF EXISTS "Authenticated users can update drivers" ON public.drivers;
DROP POLICY IF EXISTS "Authenticated users can delete drivers" ON public.drivers;

CREATE POLICY "Only admins can insert drivers" 
  ON public.drivers FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update drivers" 
  ON public.drivers FOR UPDATE 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete drivers" 
  ON public.drivers FOR DELETE 
  TO authenticated 
  USING (public.is_admin());

-- Races table
DROP POLICY IF EXISTS "Authenticated users can insert races" ON public.races;
DROP POLICY IF EXISTS "Authenticated users can update races" ON public.races;
DROP POLICY IF EXISTS "Authenticated users can delete races" ON public.races;

CREATE POLICY "Only admins can insert races" 
  ON public.races FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update races" 
  ON public.races FOR UPDATE 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete races" 
  ON public.races FOR DELETE 
  TO authenticated 
  USING (public.is_admin());

-- Race events table
DROP POLICY IF EXISTS "Authenticated users can insert race events" ON public.race_events;
DROP POLICY IF EXISTS "Authenticated users can update race events" ON public.race_events;
DROP POLICY IF EXISTS "Authenticated users can delete race events" ON public.race_events;

CREATE POLICY "Only admins can insert race events" 
  ON public.race_events FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update race events" 
  ON public.race_events FOR UPDATE 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete race events" 
  ON public.race_events FOR DELETE 
  TO authenticated 
  USING (public.is_admin());

-- Qualifying results table
DROP POLICY IF EXISTS "Authenticated users can insert qualifying results" ON public.qualifying_results;
DROP POLICY IF EXISTS "Authenticated users can update qualifying results" ON public.qualifying_results;
DROP POLICY IF EXISTS "Authenticated users can delete qualifying results" ON public.qualifying_results;

CREATE POLICY "Only admins can insert qualifying results" 
  ON public.qualifying_results FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update qualifying results" 
  ON public.qualifying_results FOR UPDATE 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete qualifying results" 
  ON public.qualifying_results FOR DELETE 
  TO authenticated 
  USING (public.is_admin());

-- Team achievements table
DROP POLICY IF EXISTS "Authenticated users can insert achievements" ON public.team_achievements;
DROP POLICY IF EXISTS "Authenticated users can update achievements" ON public.team_achievements;
DROP POLICY IF EXISTS "Authenticated users can delete achievements" ON public.team_achievements;

CREATE POLICY "Only admins can insert achievements" 
  ON public.team_achievements FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update achievements" 
  ON public.team_achievements FOR UPDATE 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete achievements" 
  ON public.team_achievements FOR DELETE 
  TO authenticated 
  USING (public.is_admin());

-- FAQ table
DROP POLICY IF EXISTS "Authenticated users can insert faq" ON public.faq;
DROP POLICY IF EXISTS "Authenticated users can update faq" ON public.faq;
DROP POLICY IF EXISTS "Authenticated users can delete faq" ON public.faq;

CREATE POLICY "Only admins can insert faq" 
  ON public.faq FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update faq" 
  ON public.faq FOR UPDATE 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete faq" 
  ON public.faq FOR DELETE 
  TO authenticated 
  USING (public.is_admin());

-- Images table
DROP POLICY IF EXISTS "Authenticated users can insert images" ON public.images;
DROP POLICY IF EXISTS "Authenticated users can update images" ON public.images;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON public.images;

CREATE POLICY "Only admins can insert images" 
  ON public.images FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update images" 
  ON public.images FOR UPDATE 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete images" 
  ON public.images FOR DELETE 
  TO authenticated 
  USING (public.is_admin());

-- Categories table
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.categories;

CREATE POLICY "Only admins can insert categories" 
  ON public.categories FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update categories" 
  ON public.categories FOR UPDATE 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete categories" 
  ON public.categories FOR DELETE 
  TO authenticated 
  USING (public.is_admin());

-- Event types table
DROP POLICY IF EXISTS "Authenticated users can insert event types" ON public.event_types;
DROP POLICY IF EXISTS "Authenticated users can update event types" ON public.event_types;
DROP POLICY IF EXISTS "Authenticated users can delete event types" ON public.event_types;

CREATE POLICY "Only admins can insert event types" 
  ON public.event_types FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update event types" 
  ON public.event_types FOR UPDATE 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete event types" 
  ON public.event_types FOR DELETE 
  TO authenticated 
  USING (public.is_admin());

-- Track info table
DROP POLICY IF EXISTS "Authenticated users can insert track info" ON public.track_info;
DROP POLICY IF EXISTS "Authenticated users can update track_info" ON public.track_info;
DROP POLICY IF EXISTS "Authenticated users can delete track_info" ON public.track_info;

CREATE POLICY "Only admins can insert track info" 
  ON public.track_info FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update track info" 
  ON public.track_info FOR UPDATE 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete track info" 
  ON public.track_info FOR DELETE 
  TO authenticated 
  USING (public.is_admin());

-- Achievement positions table
DROP POLICY IF EXISTS "Authenticated users can insert achievement positions" ON public.achievement_positions;
DROP POLICY IF EXISTS "Authenticated users can update achievement positions" ON public.achievement_positions;
DROP POLICY IF EXISTS "Authenticated users can delete achievement positions" ON public.achievement_positions;

CREATE POLICY "Only admins can insert achievement positions" 
  ON public.achievement_positions FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update achievement positions" 
  ON public.achievement_positions FOR UPDATE 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete achievement positions" 
  ON public.achievement_positions FOR DELETE 
  TO authenticated 
  USING (public.is_admin());

-- Championship standings table
DROP POLICY IF EXISTS "Authenticated users can insert championship standings" ON public.championship_standings;
DROP POLICY IF EXISTS "Authenticated users can update championship standings" ON public.championship_standings;
DROP POLICY IF EXISTS "Authenticated users can delete championship standings" ON public.championship_standings;

CREATE POLICY "Only admins can insert championship standings" 
  ON public.championship_standings FOR INSERT 
  TO authenticated 
  WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update championship standings" 
  ON public.championship_standings FOR UPDATE 
  TO authenticated 
  USING (public.is_admin());

CREATE POLICY "Only admins can delete championship standings" 
  ON public.championship_standings FOR DELETE 
  TO authenticated 
  USING (public.is_admin());

-- =============================================
-- Update admin_users policy to use is_admin function
-- =============================================

DROP POLICY IF EXISTS "Only admins can view admin_users" ON public.admin_users;

CREATE POLICY "Only admins can view admin_users"
  ON public.admin_users
  FOR SELECT
  USING (public.is_admin());

-- =============================================
-- Update storage policies to use admin check
-- =============================================

-- Track weather bucket
DROP POLICY IF EXISTS "Authenticated users can upload weather images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update weather images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete weather images" ON storage.objects;

CREATE POLICY "Only admins can upload weather images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'track-weather' AND public.is_admin());

CREATE POLICY "Only admins can update weather images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'track-weather' AND public.is_admin());

CREATE POLICY "Only admins can delete weather images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'track-weather' AND public.is_admin());

-- Track images bucket
DROP POLICY IF EXISTS "Authenticated users can upload track images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update track images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete track images" ON storage.objects;

CREATE POLICY "Only admins can upload track images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'track-images' AND public.is_admin());

CREATE POLICY "Only admins can update track images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'track-images' AND public.is_admin());

CREATE POLICY "Only admins can delete track images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'track-images' AND public.is_admin());

-- ChampionshipLogos bucket
DROP POLICY IF EXISTS "Authenticated users can upload to ChampionshipLogos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update ChampionshipLogos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete from ChampionshipLogos" ON storage.objects;

CREATE POLICY "Only admins can upload to ChampionshipLogos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'ChampionshipLogos' AND public.is_admin());

CREATE POLICY "Only admins can update ChampionshipLogos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'ChampionshipLogos' AND public.is_admin());

CREATE POLICY "Only admins can delete from ChampionshipLogos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'ChampionshipLogos' AND public.is_admin());
