-- Add session_type column to time_slots table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_slots' AND column_name = 'session_type'
  ) THEN
    ALTER TABLE time_slots
    ADD COLUMN session_type TEXT NOT NULL DEFAULT 'free';
  END IF;
END $$;

-- Add check constraint for session_type values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'check_session_type'
  ) THEN
    ALTER TABLE time_slots
    ADD CONSTRAINT check_session_type
    CHECK (session_type IN ('free', 'paid'));
  END IF;
END $$;

-- Update existing slots to have default 'free' session_type if they don't have one
UPDATE time_slots
SET session_type = 'free'
WHERE session_type IS NULL;

-- Update the unique constraint to include session_type
-- First drop the existing unique constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'time_slots_date_time_slot_type_key'
  ) THEN
    ALTER TABLE time_slots DROP CONSTRAINT time_slots_date_time_slot_type_key;
  END IF;
END $$;

-- Add new unique constraint that includes session_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'time_slots_date_time_slot_type_session_type_key'
  ) THEN
    ALTER TABLE time_slots
    ADD CONSTRAINT time_slots_date_time_slot_type_session_type_key
    UNIQUE(date, time, slot_type, session_type);
  END IF;
END $$;

-- Create index for better performance on session_type queries
CREATE INDEX IF NOT EXISTS idx_time_slots_session_type ON time_slots(session_type);