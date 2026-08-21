-- Insert the bucket into Supabase's internal storage schema
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'apk_releases',
  'apk_releases',
  false,
  NULL,
  ARRAY['application/vnd.android.package-archive']::text[]
)
ON CONFLICT (id) DO UPDATE
SET allowed_mime_types = ARRAY['application/vnd.android.package-archive']::text[];

CREATE POLICY "Allow authenticated users to read APKs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'apk_releases');

CREATE POLICY "Allow admins to upload APKs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'apk_releases' AND
  ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN'
);

CREATE POLICY "Allow admins to update APKs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'apk_releases' AND
  ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN'
);

CREATE POLICY "Allow admins to delete APKs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'apk_releases' AND
  ((select auth.jwt()) -> 'app_metadata' ->> 'app_role'::text) = 'ADMIN'
);
