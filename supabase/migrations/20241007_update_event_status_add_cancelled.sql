-- Update event_invitations table to include 'cancelled' status
-- This allows proper cancellation tracking for events

-- First, drop the existing constraint  
ALTER TABLE event_invitations DROP CONSTRAINT IF EXISTS event_invitations_status_check;

-- Add the new constraint with 'cancelled' status included
ALTER TABLE event_invitations ADD CONSTRAINT event_invitations_status_check 
CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled'));

-- Add a cancelled_at timestamp column for tracking when events were cancelled
ALTER TABLE event_invitations ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Update any existing records that might need the cancelled status 
-- (This is just in case we have any data that needs to be migrated)
UPDATE event_invitations 
SET status = 'cancelled' 
WHERE admin_notes LIKE '%cancelled%' OR admin_notes LIKE '%cancel%';
