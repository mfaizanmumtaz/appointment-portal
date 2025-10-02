-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('business', 'student', 'in-person')),
  session_type TEXT NOT NULL CHECK (session_type IN ('free', 'paid')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  slot_id UUID REFERENCES time_slots(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  meeting_type TEXT CHECK (meeting_type IN ('online', 'in-person')),
  meeting_url TEXT,
  venue_address TEXT,
  meeting_notes TEXT,
  purpose TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create locations table (must be before time_slots due to foreign key)
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create time_slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('business', 'student', 'both')),
  session_type TEXT NOT NULL CHECK (session_type IN ('free', 'paid')) DEFAULT 'free',
  meeting_mode TEXT NOT NULL CHECK (meeting_mode IN ('online', 'in-person')) DEFAULT 'online',
  duration INTEGER NOT NULL DEFAULT 30,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  booking_status TEXT CHECK (booking_status IN ('available', 'booking', 'booked')) DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create gallery_images table
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_slot_id ON appointments(slot_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(date);
CREATE INDEX IF NOT EXISTS idx_time_slots_location_id ON time_slots(location_id);
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
CREATE INDEX IF NOT EXISTS idx_time_slots_available ON time_slots(is_available);
CREATE INDEX IF NOT EXISTS idx_time_slots_booking_status ON time_slots(booking_status);
CREATE INDEX IF NOT EXISTS idx_appointments_slot_status ON appointments(slot_id, status);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery_images("order");

-- Add unique constraint for time_slots that considers location for in-person meetings
ALTER TABLE time_slots ADD CONSTRAINT time_slots_unique_constraint 
UNIQUE(date, time, slot_type, session_type, meeting_mode, duration, location_id);

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can view available time slots' AND tablename = 'time_slots'
  ) THEN
    CREATE POLICY "Public can view available time slots"
      ON time_slots FOR SELECT
      USING (is_available = true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can view gallery images' AND tablename = 'gallery_images'
  ) THEN
    CREATE POLICY "Public can view gallery images"
      ON gallery_images FOR SELECT
      USING (true);
  END IF;
END
$$;

-- Create policies for authenticated admin access (adjust based on your auth setup)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access to appointments' AND tablename = 'appointments'
  ) THEN
    CREATE POLICY "Admin full access to appointments"
      ON appointments FOR ALL
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access to time_slots' AND tablename = 'time_slots'
  ) THEN
    CREATE POLICY "Admin full access to time_slots"
      ON time_slots FOR ALL
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access to gallery_images' AND tablename = 'gallery_images'
  ) THEN
    CREATE POLICY "Admin full access to gallery_images"
      ON gallery_images FOR ALL
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access to settings' AND tablename = 'admin_settings'
  ) THEN
    CREATE POLICY "Admin full access to settings"
      ON admin_settings FOR ALL
      USING (true);
  END IF;
END
$$;

-- Create policy for public to insert appointments (booking)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can create appointments' AND tablename = 'appointments'
  ) THEN
    CREATE POLICY "Public can create appointments"
      ON appointments FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

-- Create policies for locations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can read locations' AND tablename = 'locations'
  ) THEN
    CREATE POLICY "Public can read locations"
      ON locations FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access to locations' AND tablename = 'locations'
  ) THEN
    CREATE POLICY "Admin full access to locations"
      ON locations FOR ALL
      USING (true);
  END IF;
END
$$;

-- Create instant_messages table
CREATE TABLE IF NOT EXISTS instant_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  admin_reply TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create student_triage_log table
CREATE TABLE IF NOT EXISTS student_triage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  student_phone TEXT,
  purpose TEXT NOT NULL,
  ai_decision TEXT NOT NULL CHECK (ai_decision IN ('approved', 'declined', 'uncertain')),
  ai_reasoning TEXT NOT NULL,
  ai_confidence DECIMAL(3,2) NOT NULL CHECK (ai_confidence >= 0.0 AND ai_confidence <= 1.0),
  manual_review BOOLEAN DEFAULT false,
  manual_decision TEXT CHECK (manual_decision IN ('approved', 'declined', NULL)),
  manual_notes TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_instant_messages_status ON instant_messages(status);
CREATE INDEX IF NOT EXISTS idx_instant_messages_created_at ON instant_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_student_triage_log_decision ON student_triage_log(ai_decision);
CREATE INDEX IF NOT EXISTS idx_student_triage_log_created_at ON student_triage_log(created_at);
CREATE INDEX IF NOT EXISTS idx_student_triage_log_email ON student_triage_log(student_email);
CREATE INDEX IF NOT EXISTS idx_event_invitations_status ON event_invitations(status);
CREATE INDEX IF NOT EXISTS idx_event_invitations_event_date ON event_invitations(event_date);
CREATE INDEX IF NOT EXISTS idx_event_invitations_created_at ON event_invitations(created_at);

-- Enable Row Level Security
ALTER TABLE instant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_triage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for instant messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can create instant messages' AND tablename = 'instant_messages'
  ) THEN
    CREATE POLICY "Public can create instant messages"
      ON instant_messages FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access to instant messages' AND tablename = 'instant_messages'
  ) THEN
    CREATE POLICY "Admin full access to instant messages"
      ON instant_messages FOR ALL
      USING (true);
  END IF;
END
$$;

-- Create policies for student triage log
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can create triage logs' AND tablename = 'student_triage_log'
  ) THEN
    CREATE POLICY "Public can create triage logs"
      ON student_triage_log FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Service role can manage triage logs' AND tablename = 'student_triage_log'
  ) THEN
    CREATE POLICY "Service role can manage triage logs"
      ON student_triage_log FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- Create policies for event invitations
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

-- Add unique constraint to prevent double booking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_slot_booking'
  ) THEN
    ALTER TABLE appointments
    ADD CONSTRAINT unique_slot_booking
    UNIQUE (slot_id, date, time)
    DEFERRABLE INITIALLY DEFERRED;
  END IF;
END
$$;

-- Create atomic booking function
CREATE OR REPLACE FUNCTION book_slot_atomically(
  p_slot_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  slot_available BOOLEAN := FALSE;
BEGIN
  -- Use SELECT FOR UPDATE to lock the row and prevent race conditions
  SELECT
    (is_available = TRUE AND booking_status = 'available') INTO slot_available
  FROM time_slots
  WHERE id = p_slot_id
  FOR UPDATE;

  -- If slot is not available, return false
  IF NOT slot_available THEN
    RETURN FALSE;
  END IF;

  -- Check if there's already an appointment for this slot
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE slot_id = p_slot_id
    AND status IN ('pending', 'confirmed')
  ) THEN
    RETURN FALSE;
  END IF;

  -- Mark slot as being booked (prevents other concurrent bookings)
  UPDATE time_slots
  SET
    booking_status = 'booking',
    is_available = FALSE
  WHERE id = p_slot_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to finalize booking (called after appointment is created)
CREATE OR REPLACE FUNCTION finalize_slot_booking(
  p_slot_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE time_slots
  SET booking_status = 'booked'
  WHERE id = p_slot_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to release slot (if booking fails)
CREATE OR REPLACE FUNCTION release_slot_booking(
  p_slot_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE time_slots
  SET
    booking_status = 'available',
    is_available = TRUE
  WHERE id = p_slot_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update slot status when appointment is deleted
CREATE OR REPLACE FUNCTION handle_appointment_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Release the slot when appointment is deleted/cancelled
  IF OLD.slot_id IS NOT NULL AND OLD.status IN ('pending', 'confirmed') THEN
    -- For DELETE operations or when status changes to cancelled
    IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.status = 'cancelled') THEN
      UPDATE time_slots
      SET
        booking_status = 'available',
        is_available = TRUE
      WHERE id = OLD.slot_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for appointment deletions
DROP TRIGGER IF EXISTS appointment_deletion_trigger ON appointments;
CREATE TRIGGER appointment_deletion_trigger
  AFTER DELETE OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION handle_appointment_deletion();