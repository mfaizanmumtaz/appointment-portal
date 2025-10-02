-- Create event_invitations table for managing speaking event requests
CREATE TABLE IF NOT EXISTS event_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_title TEXT NOT NULL,
  organiser_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL,
  venue TEXT NOT NULL,
  audience_size TEXT NOT NULL CHECK (audience_size IN ('<50', '50-100', '100-250', '250-500', '500+')),
  travel_expenses TEXT NOT NULL CHECK (travel_expenses IN ('Yes', 'No', 'Partial')),
  event_details TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  rejection_reason TEXT,
  admin_notes TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_event_invitations_status ON event_invitations(status);
CREATE INDEX IF NOT EXISTS idx_event_invitations_event_date ON event_invitations(event_date);
CREATE INDEX IF NOT EXISTS idx_event_invitations_created_at ON event_invitations(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE event_invitations ENABLE ROW LEVEL SECURITY;

-- Create policy for public to insert event invitations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can create event invitations' AND tablename = 'event_invitations'
  ) THEN
    CREATE POLICY "Public can create event invitations"
      ON event_invitations FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

-- Create policy for admin to view and manage all event invitations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access to event invitations' AND tablename = 'event_invitations'
  ) THEN
    CREATE POLICY "Admin full access to event invitations"
      ON event_invitations FOR ALL
      USING (true);
  END IF;
END
$$;
