-- Create bucket for event attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-attachments', 'event-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow public read access to event attachments
CREATE POLICY "Public can view event attachments" ON storage.objects
FOR SELECT USING (bucket_id = 'event-attachments');

-- Create policy to allow public upload of event attachments
CREATE POLICY "Public can upload event attachments" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'event-attachments');

-- Create policy to allow admin to manage event attachments
CREATE POLICY "Admin can manage event attachments" ON storage.objects
FOR ALL USING (bucket_id = 'event-attachments');
