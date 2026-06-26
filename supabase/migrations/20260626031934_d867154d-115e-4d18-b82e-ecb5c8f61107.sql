
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS fabrics_cost numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS trims_cost numeric DEFAULT 0;

-- Storage policies for product-images (private bucket, per-user folder = user_id/)
CREATE POLICY "product-images read own"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "product-images insert own"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "product-images update own"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "product-images delete own"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] = auth.uid()::text);
