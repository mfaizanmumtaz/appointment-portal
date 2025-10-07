-- Create interview_requests table for managing interview/podcast requests
CREATE TABLE IF NOT EXISTS interview_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  podcaster_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  linkedin_url TEXT NOT NULL,
  youtube_link TEXT,
  facebook_link TEXT,
  agenda TEXT NOT NULL,
  preferred_date DATE,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_interview_requests_status ON interview_requests(status);
CREATE INDEX IF NOT EXISTS idx_interview_requests_email ON interview_requests(email);
CREATE INDEX IF NOT EXISTS idx_interview_requests_created_at ON interview_requests(created_at);

-- Enable Row Level Security
ALTER TABLE interview_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for interview requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can create interview requests' AND tablename = 'interview_requests'
  ) THEN
    CREATE POLICY "Public can create interview requests"
      ON interview_requests FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access to interview requests' AND tablename = 'interview_requests'
  ) THEN
    CREATE POLICY "Admin full access to interview requests"
      ON interview_requests FOR ALL
      USING (true);
  END IF;
END
$$;
