-- Add color column to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS color TEXT;

-- Set initial colors for existing categories (hex format)
UPDATE public.categories SET color = '#94A3B8' WHERE name = 'GERAL' AND color IS NULL;
UPDATE public.categories SET color = '#3B82F6' WHERE name = 'LMP2' AND color IS NULL;
UPDATE public.categories SET color = '#F97316' WHERE name = 'GT3 PRO' AND color IS NULL;
