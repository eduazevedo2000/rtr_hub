-- Create enum for race event types
CREATE TYPE public.race_event_type AS ENUM (
  'race_start',
  'pit_stop',
  'position_change',
  'fcy_short',
  'fcy_long',
  'incident',
  'driver_change',
  'restart',
  'finish',
  'other'
);

-- Create races table
CREATE TABLE public.races (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  track TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create race_events table (ocorrências de corrida)
CREATE TABLE public.race_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  race_id UUID REFERENCES public.races(id) ON DELETE CASCADE NOT NULL,
  lap INTEGER NOT NULL,
  description TEXT NOT NULL,
  event_type race_event_type NOT NULL DEFAULT 'other',
  position TEXT,
  driver TEXT,
  clip_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create qualifying_results table
CREATE TABLE public.qualifying_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  race_id UUID REFERENCES public.races(id) ON DELETE CASCADE NOT NULL,
  driver TEXT NOT NULL,
  lap_time TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_achievements table (Palmarés)
CREATE TABLE public.team_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create faq table
CREATE TABLE public.faq (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create track_info table (weather forecast and track map)
CREATE TABLE public.track_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  race_id UUID REFERENCES public.races(id) ON DELETE CASCADE NOT NULL,
  weather_image_url TEXT,
  track_map_url TEXT,
  weather_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qualifying_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_info ENABLE ROW LEVEL SECURITY;

-- Create public read policies (everyone can view)
CREATE POLICY "Anyone can view races" ON public.races FOR SELECT USING (true);
CREATE POLICY "Anyone can view race events" ON public.race_events FOR SELECT USING (true);
CREATE POLICY "Anyone can view qualifying results" ON public.qualifying_results FOR SELECT USING (true);
CREATE POLICY "Anyone can view achievements" ON public.team_achievements FOR SELECT USING (true);
CREATE POLICY "Anyone can view faq" ON public.faq FOR SELECT USING (true);
CREATE POLICY "Anyone can view track info" ON public.track_info FOR SELECT USING (true);

-- Create insert policies for authenticated users (admin)
CREATE POLICY "Authenticated users can insert races" ON public.races FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert race events" ON public.race_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert qualifying results" ON public.qualifying_results FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert achievements" ON public.team_achievements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert faq" ON public.faq FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert track info" ON public.track_info FOR INSERT TO authenticated WITH CHECK (true);

-- Create update policies for authenticated users
CREATE POLICY "Authenticated users can update races" ON public.races FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update race events" ON public.race_events FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update qualifying results" ON public.qualifying_results FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update achievements" ON public.team_achievements FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update faq" ON public.faq FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can update track info" ON public.track_info FOR UPDATE TO authenticated USING (true);

-- Create delete policies for authenticated users
CREATE POLICY "Authenticated users can delete races" ON public.races FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete race events" ON public.race_events FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete qualifying results" ON public.qualifying_results FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete achievements" ON public.team_achievements FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete faq" ON public.faq FOR DELETE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete track info" ON public.track_info FOR DELETE TO authenticated USING (true);

-- Enable realtime for race_events table
ALTER PUBLICATION supabase_realtime ADD TABLE public.race_events;