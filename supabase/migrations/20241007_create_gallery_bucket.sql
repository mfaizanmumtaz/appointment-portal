-- Create bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true);

-- Create policies for gallery images bucket
CREATE POLICY "Public can view gallery images" ON storage.objects
FOR SELECT USING (bucket_id = 'gallery-images');

-- Allow admin to upload gallery images
CREATE POLICY "Admin can upload gallery images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'gallery-images');

-- Allow admin to manage all gallery images
CREATE POLICY "Admin can manage gallery images" ON storage.objects
FOR ALL USING (bucket_id = 'gallery-images');
