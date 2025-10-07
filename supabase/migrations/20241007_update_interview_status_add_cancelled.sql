-- Update interview_requests table to include 'cancelled' status
-- This allows proper cancellation tracking for interviews

-- First, drop the existing constraint
ALTER TABLE interview_requests DROP CONSTRAINT IF EXISTS interview_requests_status_check;

-- Add the new constraint with 'cancelled' status included
ALTER TABLE interview_requests ADD CONSTRAINT interview_requests_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled'));

-- Update any existing records that might need the cancelled status
-- (This is just in case we have any data that needs to be migrated)
UPDATE interview_requests 
SET status = 'cancelled' 
WHERE admin_notes LIKE '%cancelled%' OR admin_notes LIKE '%cancel%';
