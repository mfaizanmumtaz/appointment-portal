-- Create quick_replies table for dynamic quick chat responses
CREATE TABLE IF NOT EXISTS quick_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for ordering and filtering
CREATE INDEX IF NOT EXISTS idx_quick_replies_order ON quick_replies(order_index) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_quick_replies_active ON quick_replies(is_active);

-- Enable Row Level Security
ALTER TABLE quick_replies ENABLE ROW LEVEL SECURITY;

-- Create policies for quick replies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access to quick replies' AND tablename = 'quick_replies'
  ) THEN
    CREATE POLICY "Admin full access to quick replies"
      ON quick_replies FOR ALL
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public can read active quick replies' AND tablename = 'quick_replies'
  ) THEN
    CREATE POLICY "Public can read active quick replies"
      ON quick_replies FOR SELECT
      USING (is_active = true);
  END IF;
END
$$;

-- Insert default quick replies
INSERT INTO quick_replies (message, order_index, is_active) VALUES
  ('Thank you for your message! I''ll get back to you shortly.', 1, true),
  ('Your request has been received. I''ll review it and respond within 24 hours.', 2, true),
  ('Please provide more details about your project so I can better assist you.', 3, true),
  ('Your session has been confirmed. You''ll receive a calendar invite soon.', 4, true),
  ('Thank you for your interest in our services.', 5, true)
ON CONFLICT DO NOTHING;
