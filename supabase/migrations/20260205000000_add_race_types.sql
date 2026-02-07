-- Add new values to race_type enum
ALTER TYPE public.race_type ADD VALUE IF NOT EXISTS 'hosted';
ALTER TYPE public.race_type ADD VALUE IF NOT EXISTS 'comunidade';
