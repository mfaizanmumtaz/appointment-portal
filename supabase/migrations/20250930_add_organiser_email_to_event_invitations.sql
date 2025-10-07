-- Add organiser_email column to event_invitations table
ALTER TABLE event_invitations 
ADD COLUMN organiser_email text NOT NULL DEFAULT '';

-- Update the column to remove the default after adding it
ALTER TABLE event_invitations 
ALTER COLUMN organiser_email DROP DEFAULT;
