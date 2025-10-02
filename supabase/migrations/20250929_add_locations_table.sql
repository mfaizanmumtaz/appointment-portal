-- Create simplified locations table for managing meeting venues
-- Handle existing table by dropping constraints and recreating
DO $$
BEGIN
  -- Drop foreign key constraint from time_slots if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name LIKE '%location%' 
    AND table_name = 'time_slots'
  ) THEN
    ALTER TABLE time_slots DROP CONSTRAINT IF EXISTS time_slots_location_id_fkey;
  END IF;
  
  -- Drop the locations table if it exists
  DROP TABLE IF EXISTS locations CASCADE;
END $$;

-- Create new simplified locations table
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add location_id to time_slots table
DO $$
BEGIN
  -- Remove existing location_id column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'time_slots' AND column_name = 'location_id'
  ) THEN
    ALTER TABLE time_slots DROP COLUMN location_id;
  END IF;
  
  -- Add new location_id column with foreign key
  ALTER TABLE time_slots
  ADD COLUMN location_id UUID REFERENCES locations(id) ON DELETE SET NULL;
END $$;

-- No default locations - CEO will add them through the admin interface

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);
CREATE INDEX IF NOT EXISTS idx_time_slots_location_id ON time_slots(location_id);

-- Update the unique constraint on time_slots to include location_id for in-person meetings
-- First drop existing constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'time_slots_date_time_slot_type_session_type_meeting_mode_duration_key'
  ) THEN
    ALTER TABLE time_slots DROP CONSTRAINT time_slots_date_time_slot_type_session_type_meeting_mode_duration_key;
  END IF;
END $$;

-- Add new constraint that considers location for in-person meetings
-- For online meetings, location_id should be NULL, so we can have multiple online slots at the same time
-- For in-person meetings, we need unique combination including location_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE constraint_name = 'time_slots_unique_constraint'
  ) THEN
    ALTER TABLE time_slots
    ADD CONSTRAINT time_slots_unique_constraint
    UNIQUE(date, time, slot_type, session_type, meeting_mode, duration, location_id);
  END IF;
END $$;
