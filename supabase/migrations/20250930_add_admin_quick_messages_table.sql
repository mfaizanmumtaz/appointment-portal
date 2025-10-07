-- Create admin_quick_messages table for managing dynamic quick replies
CREATE TABLE IF NOT EXISTS admin_quick_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_quick_messages_sort_order ON admin_quick_messages(sort_order);
CREATE INDEX IF NOT EXISTS idx_admin_quick_messages_is_active ON admin_quick_messages(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE admin_quick_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for public access to quick messages (since this is admin functionality)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can read quick messages' AND tablename = 'admin_quick_messages'
  ) THEN
    CREATE POLICY "Public can read quick messages"
      ON admin_quick_messages FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can manage quick messages' AND tablename = 'admin_quick_messages'
  ) THEN
    CREATE POLICY "Public can manage quick messages"
      ON admin_quick_messages FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;
