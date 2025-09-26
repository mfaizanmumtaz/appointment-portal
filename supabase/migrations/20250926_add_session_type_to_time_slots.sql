-- Add session_type column to time_slots table
ALTER TABLE time_slots
ADD COLUMN session_type TEXT NOT NULL DEFAULT 'free'
CHECK (session_type IN ('free', 'paid'));

-- Update the unique constraint to include session_type
-- First drop the existing unique constraint
ALTER TABLE time_slots DROP CONSTRAINT IF EXISTS time_slots_date_time_slot_type_key;

-- Add new unique constraint that includes session_type
ALTER TABLE time_slots
ADD CONSTRAINT time_slots_date_time_slot_type_session_type_key
UNIQUE(date, time, slot_type, session_type);

-- Create index for better performance on session_type queries
CREATE INDEX IF NOT EXISTS idx_time_slots_session_type ON time_slots(session_type);