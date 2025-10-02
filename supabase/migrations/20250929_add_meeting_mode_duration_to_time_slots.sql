-- Add meeting_mode and duration columns to time_slots table
DO $$
BEGIN
  -- Add meeting_mode column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_slots' AND column_name = 'meeting_mode'
  ) THEN
    ALTER TABLE time_slots
    ADD COLUMN meeting_mode TEXT NOT NULL DEFAULT 'online';
  END IF;

  -- Add duration column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_slots' AND column_name = 'duration'
  ) THEN
    ALTER TABLE time_slots
    ADD COLUMN duration INTEGER NOT NULL DEFAULT 30;
  END IF;
END $$;

-- Add check constraint for meeting_mode values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'check_meeting_mode'
  ) THEN
    ALTER TABLE time_slots
    ADD CONSTRAINT check_meeting_mode
    CHECK (meeting_mode IN ('online', 'in-person'));
  END IF;
END $$;

-- Add check constraint for duration values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'check_duration'
  ) THEN
    ALTER TABLE time_slots
    ADD CONSTRAINT check_duration
    CHECK (duration IN (15, 30, 45));
  END IF;
END $$;

-- Update existing slots to have default values if they don't have them
UPDATE time_slots
SET meeting_mode = 'online'
WHERE meeting_mode IS NULL;

UPDATE time_slots
SET duration = 30
WHERE duration IS NULL;

-- Update the unique constraint to include meeting_mode and duration
-- First drop the existing unique constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'time_slots_date_time_slot_type_session_type_key'
  ) THEN
    ALTER TABLE time_slots DROP CONSTRAINT time_slots_date_time_slot_type_session_type_key;
  END IF;
END $$;

-- Add new unique constraint that includes meeting_mode and duration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'time_slots_date_time_slot_type_session_type_meeting_mode_duration_key'
  ) THEN
    ALTER TABLE time_slots
    ADD CONSTRAINT time_slots_date_time_slot_type_session_type_meeting_mode_duration_key
    UNIQUE(date, time, slot_type, session_type, meeting_mode, duration);
  END IF;
END $$;

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_time_slots_meeting_mode ON time_slots(meeting_mode);
CREATE INDEX IF NOT EXISTS idx_time_slots_duration ON time_slots(duration);
