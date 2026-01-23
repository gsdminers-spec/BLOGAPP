-- ==================================================
-- FIX: Allow Image Uploads to 'blog-assets'
-- ==================================================

-- 1. Grant usage on storage schema (standard requirement)
GRANT USAGE ON SCHEMA storage TO postgres, anon, authenticated, service_role;

-- 2. Allow Public Uploads (INSERT) to 'blog-assets'
-- This fixes the "new row violates row-level security policy" error.
CREATE POLICY "Allow Public Uploads"
ON storage.objects
FOR INSERT
TO public
WITH CHECK ( bucket_id = 'blog-assets' );

-- 3. Allow Public Viewing (SELECT)
-- Ensures the images can be seen after upload
CREATE POLICY "Allow Public Viewing"
ON storage.objects
FOR SELECT
TO public
USING ( bucket_id = 'blog-assets' );

-- 4. Allow Public Updates/Deletes (Optional, good for managing own files)
CREATE POLICY "Allow Public Update"
ON storage.objects
FOR UPDATE
TO public
USING ( bucket_id = 'blog-assets' );

CREATE POLICY "Allow Public Delete"
ON storage.objects
FOR DELETE
TO public
USING ( bucket_id = 'blog-assets' );
