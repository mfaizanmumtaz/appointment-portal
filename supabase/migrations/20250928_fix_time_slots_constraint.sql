-- Fix time_slots unique constraint issue
-- Remove any old/conflicting unique constraints and ensure correct one exists

-- Drop old constraints that may be causing conflicts
DO $$
BEGIN
  -- Drop the old constraint if it exists (date, time only)
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'time_slots_date_time_key'
  ) THEN
    ALTER TABLE time_slots DROP CONSTRAINT time_slots_date_time_key;
  END IF;

  -- Drop old constraint (date, time, slot_type)
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'time_slots_date_time_slot_type_key'
  ) THEN
    ALTER TABLE time_slots DROP CONSTRAINT time_slots_date_time_slot_type_key;
  END IF;
END $$;

-- Ensure the correct unique constraint exists (date, time, slot_type, session_type)
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

-- Add comment explaining the constraint
COMMENT ON CONSTRAINT time_slots_date_time_slot_type_session_type_key ON time_slots
IS 'Ensures no duplicate slots for same date, time, slot_type, and session_type combination';