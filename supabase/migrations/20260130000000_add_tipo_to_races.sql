-- Create enum for race type
CREATE TYPE public.race_type AS ENUM ('vsca', 'iracing');

-- Add tipo column to races
ALTER TABLE public.races ADD COLUMN IF NOT EXISTS tipo race_type NULL;
