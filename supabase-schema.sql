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
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create time_slots table
CREATE TABLE IF NOT EXISTS time_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('business', 'student', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(date, time, slot_type)
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
CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(date);
CREATE INDEX IF NOT EXISTS idx_time_slots_available ON time_slots(is_available);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery_images("order");

-- Enable Row Level Security
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
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

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_instant_messages_status ON instant_messages(status);
CREATE INDEX IF NOT EXISTS idx_instant_messages_created_at ON instant_messages(created_at);

-- Enable Row Level Security
ALTER TABLE instant_messages ENABLE ROW LEVEL SECURITY;

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