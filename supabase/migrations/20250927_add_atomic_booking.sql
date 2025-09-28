-- Migration to add atomic booking functionality
-- This prevents race conditions when multiple users try to book the same slot

-- First, add a booking status to time_slots to track if slot is being booked
ALTER TABLE time_slots ADD COLUMN IF NOT EXISTS booking_status TEXT
CHECK (booking_status IN ('available', 'booking', 'booked')) DEFAULT 'available';

-- Add unique constraint to prevent double booking
-- This ensures only ONE appointment can exist per slot
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
  p_slot_id UUID,
  p_date DATE,
  p_time TEXT,
  p_slot_type TEXT,
  p_session_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  slot_available BOOLEAN := FALSE;
BEGIN
  -- Use SELECT FOR UPDATE to lock the row and prevent race conditions
  SELECT
    (is_available = TRUE AND booking_status = 'available') INTO slot_available
  FROM time_slots
  WHERE
    id = p_slot_id
    AND date = p_date
    AND time = p_time
    AND slot_type = p_slot_type
    AND (session_type = p_session_type OR session_type IS NULL)
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
) RETURNS VOID AS $$
BEGIN
  UPDATE time_slots
  SET
    booking_status = 'available',
    is_available = TRUE
  WHERE id = p_slot_id;
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

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION book_slot_atomically TO anon, authenticated;
GRANT EXECUTE ON FUNCTION finalize_slot_booking TO anon, authenticated;
GRANT EXECUTE ON FUNCTION release_slot_booking TO anon, authenticated;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_time_slots_booking_status ON time_slots(booking_status);
CREATE INDEX IF NOT EXISTS idx_appointments_slot_status ON appointments(slot_id, status);