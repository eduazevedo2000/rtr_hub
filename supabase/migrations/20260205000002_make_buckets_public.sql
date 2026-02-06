-- Tornar o bucket track-weather público
UPDATE storage.buckets
SET public = true
WHERE id = 'track-weather';

-- Tornar o bucket track-images público
UPDATE storage.buckets
SET public = true
WHERE id = 'track-images';
