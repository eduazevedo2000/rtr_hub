-- Create achievement_positions table to store multiple positions per achievement (one per category)
CREATE TABLE IF NOT EXISTS public.achievement_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  achievement_id UUID REFERENCES public.team_achievements(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  position_finished TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(achievement_id, category)
);

-- Enable RLS
ALTER TABLE public.achievement_positions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view achievement positions" ON public.achievement_positions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert achievement positions" ON public.achievement_positions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update achievement positions" ON public.achievement_positions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete achievement positions" ON public.achievement_positions FOR DELETE TO authenticated USING (true);

-- Migrate existing data from team_achievements.position_finished and category to achievement_positions
-- Only migrate if both position_finished and category exist
INSERT INTO public.achievement_positions (achievement_id, category, position_finished)
SELECT 
  id as achievement_id,
  category,
  position_finished
FROM public.team_achievements
WHERE position_finished IS NOT NULL 
  AND category IS NOT NULL
  AND category != 'GERAL'
ON CONFLICT (achievement_id, category) DO NOTHING;
