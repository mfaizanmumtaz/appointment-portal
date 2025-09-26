-- Migration: Add slot_id foreign key to appointments table
-- This creates proper data integrity between time_slots and appointments

-- Step 1: Add the slot_id column (nullable initially for existing data)
ALTER TABLE appointments ADD COLUMN slot_id UUID REFERENCES time_slots(id) ON DELETE CASCADE;

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_appointments_slot_id ON appointments(slot_id);

-- Step 3: Populate slot_id for existing appointments
-- This matches existing appointments with their corresponding slots
UPDATE appointments
SET slot_id = (
  SELECT ts.id
  FROM time_slots ts
  WHERE ts.date = appointments.date
    AND ts.time = appointments.time
    AND (
      (appointments.type = 'business' AND ts.slot_type IN ('business', 'both')) OR
      (appointments.type = 'student' AND ts.slot_type IN ('student', 'both')) OR
      (appointments.type = 'in-person' AND ts.slot_type IN ('business', 'student', 'both'))
    )
  LIMIT 1
)
WHERE slot_id IS NULL;

-- Step 4: Create slots for appointments that don't have matching time_slots
-- This handles any orphaned appointments
INSERT INTO time_slots (date, time, is_available, slot_type)
SELECT DISTINCT
  a.date,
  a.time,
  false, -- Mark as unavailable since they have appointments
  CASE
    WHEN a.type = 'business' THEN 'business'
    WHEN a.type = 'student' THEN 'student'
    WHEN a.type = 'in-person' THEN 'both'
    ELSE 'both'
  END as slot_type
FROM appointments a
LEFT JOIN time_slots ts ON (
  ts.date = a.date
  AND ts.time = a.time
  AND (
    (a.type = 'business' AND ts.slot_type IN ('business', 'both')) OR
    (a.type = 'student' AND ts.slot_type IN ('student', 'both')) OR
    (a.type = 'in-person' AND ts.slot_type IN ('business', 'student', 'both'))
  )
)
WHERE ts.id IS NULL
  AND a.status IN ('confirmed', 'pending');

-- Step 5: Update slot_id for appointments that still don't have one
UPDATE appointments
SET slot_id = (
  SELECT ts.id
  FROM time_slots ts
  WHERE ts.date = appointments.date
    AND ts.time = appointments.time
    AND (
      (appointments.type = 'business' AND ts.slot_type IN ('business', 'both')) OR
      (appointments.type = 'student' AND ts.slot_type IN ('student', 'both')) OR
      (appointments.type = 'in-person' AND ts.slot_type IN ('business', 'student', 'both'))
    )
  LIMIT 1
)
WHERE slot_id IS NULL;

-- Step 6: Add constraint to make slot_id required for future appointments
-- (We'll handle this in the application logic to avoid breaking existing NULL values)

-- Step 7: Update policies to work with the new relationship
DROP POLICY IF EXISTS "Public can view available time slots" ON time_slots;
CREATE POLICY "Public can view available time slots"
  ON time_slots FOR SELECT
  USING (is_available = true);

-- Add policy for appointments to access their related slots
DROP POLICY IF EXISTS "Appointments can access their slots" ON time_slots;
CREATE POLICY "Appointments can access their slots"
  ON time_slots FOR SELECT
  USING (
    id IN (
      SELECT slot_id FROM appointments
      WHERE appointments.slot_id = time_slots.id
    )
  );

-- Add trigger to automatically mark slots as unavailable when appointment is created
CREATE OR REPLACE FUNCTION mark_slot_unavailable()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slot_id IS NOT NULL AND NEW.status IN ('confirmed', 'pending') THEN
    UPDATE time_slots
    SET is_available = false
    WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_mark_slot_unavailable
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION mark_slot_unavailable();

-- Add trigger to mark slots as available when appointment is cancelled
CREATE OR REPLACE FUNCTION handle_appointment_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If appointment is cancelled or completed, mark slot as available
  IF NEW.status IN ('cancelled', 'completed') AND OLD.status IN ('confirmed', 'pending') THEN
    UPDATE time_slots
    SET is_available = true
    WHERE id = NEW.slot_id;
  -- If appointment is confirmed/pending, mark slot as unavailable
  ELSIF NEW.status IN ('confirmed', 'pending') AND OLD.status IN ('cancelled', 'completed') THEN
    UPDATE time_slots
    SET is_available = false
    WHERE id = NEW.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_appointment_status_change
  AFTER UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION handle_appointment_status_change();