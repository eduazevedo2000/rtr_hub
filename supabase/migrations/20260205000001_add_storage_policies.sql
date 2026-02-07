-- =============================================
-- Storage Policies para track-weather bucket
-- =============================================

-- Permitir utilizadores autenticados a fazer upload
CREATE POLICY "Authenticated users can upload weather images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'track-weather');

-- Permitir utilizadores autenticados a atualizar suas imagens
CREATE POLICY "Authenticated users can update weather images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'track-weather');

-- Permitir utilizadores autenticados a apagar suas imagens
CREATE POLICY "Authenticated users can delete weather images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'track-weather');

-- Permitir leitura pública das imagens
CREATE POLICY "Public can view weather images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'track-weather');

-- =============================================
-- Storage Policies para track-images bucket
-- =============================================

-- Permitir utilizadores autenticados a fazer upload
CREATE POLICY "Authenticated users can upload track images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'track-images');

-- Permitir utilizadores autenticados a atualizar suas imagens
CREATE POLICY "Authenticated users can update track images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'track-images');

-- Permitir utilizadores autenticados a apagar suas imagens
CREATE POLICY "Authenticated users can delete track images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'track-images');

-- Permitir leitura pública das imagens
CREATE POLICY "Public can view track images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'track-images');

-- =============================================
-- Table Policies para images
-- =============================================

-- Ativar RLS na tabela images (se ainda não estiver ativo)
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Permitir utilizadores autenticados a inserir imagens
CREATE POLICY "Authenticated users can insert images"
ON public.images FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir utilizadores autenticados a atualizar imagens
CREATE POLICY "Authenticated users can update images"
ON public.images FOR UPDATE
TO authenticated
USING (true);

-- Permitir utilizadores autenticados a apagar imagens
CREATE POLICY "Authenticated users can delete images"
ON public.images FOR DELETE
TO authenticated
USING (true);

-- Permitir leitura pública das imagens
CREATE POLICY "Public can view images"
ON public.images FOR SELECT
TO public
USING (true);

-- =============================================
-- Table Policies para track_info
-- =============================================

-- Ativar RLS na tabela track_info (se ainda não estiver ativo)
ALTER TABLE public.track_info ENABLE ROW LEVEL SECURITY;

-- Permitir utilizadores autenticados a inserir track_info
CREATE POLICY "Authenticated users can insert track_info"
ON public.track_info FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir utilizadores autenticados a atualizar track_info
CREATE POLICY "Authenticated users can update track_info"
ON public.track_info FOR UPDATE
TO authenticated
USING (true);

-- Permitir utilizadores autenticados a apagar track_info
CREATE POLICY "Authenticated users can delete track_info"
ON public.track_info FOR DELETE
TO authenticated
USING (true);

-- Permitir leitura pública de track_info
CREATE POLICY "Public can view track_info"
ON public.track_info FOR SELECT
TO public
USING (true);
