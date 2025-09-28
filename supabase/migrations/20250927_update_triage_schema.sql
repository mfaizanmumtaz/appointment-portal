-- Migration to update student_triage_log schema to match AI triage UI component
-- This keeps the UI component unchanged while updating the database structure

-- Clear all existing data for a clean start
DELETE FROM student_triage_log WHERE true;

-- Add new columns to support both business and student categories
ALTER TABLE student_triage_log
ADD COLUMN IF NOT EXISTS category TEXT
CHECK (category IN ('business', 'student')) DEFAULT 'student';

ALTER TABLE student_triage_log
ADD COLUMN IF NOT EXISTS reason TEXT;

ALTER TABLE student_triage_log
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW());

-- Add status field to replace the manual_review/manual_decision system
ALTER TABLE student_triage_log
ADD COLUMN IF NOT EXISTS status TEXT
CHECK (status IN ('refused', 'reached-back', 'approved')) DEFAULT 'refused';

-- Add details JSONB field for flexible company/school/purpose storage
ALTER TABLE student_triage_log
ADD COLUMN IF NOT EXISTS details JSONB DEFAULT '{}';

-- Create mapping view that matches the UI component interface
CREATE OR REPLACE VIEW ai_triage_entries AS
SELECT
  id,
  student_name as "userName",
  student_email as "userEmail",
  category,
  COALESCE(reason,
    CASE
      WHEN ai_decision = 'declined' THEN 'AI determined request should be declined'
      WHEN ai_decision = 'uncertain' THEN 'Request requires manual review'
      ELSE 'Approved by AI'
    END
  ) as reason,
  ai_reasoning as "aiReason",
  TO_CHAR(COALESCE(submitted_at, created_at), 'YYYY-MM-DD HH12:MI AM') as "submittedAt",
  CASE
    WHEN manual_review AND manual_decision = 'declined' THEN 'reached-back'
    WHEN manual_review AND manual_decision = 'approved' THEN 'approved'
    WHEN ai_decision = 'declined' THEN 'refused'
    ELSE 'refused'
  END as status,
  COALESCE(details,
    jsonb_build_object(
      'purpose', purpose,
      'school', CASE WHEN category = 'student' THEN 'Unknown School' ELSE NULL END,
      'company', CASE WHEN category = 'business' THEN 'Unknown Company' ELSE NULL END
    )
  ) as details,
  created_at,
  manual_review,
  manual_decision,
  manual_notes,
  reviewed_by,
  reviewed_at
FROM student_triage_log
ORDER BY created_at DESC;

-- Update existing data to populate new fields
UPDATE student_triage_log
SET
  details = jsonb_build_object('purpose', purpose),
  submitted_at = created_at,
  reason = CASE
    WHEN ai_decision = 'declined' THEN 'Request declined by AI filter'
    WHEN ai_decision = 'uncertain' THEN 'Request requires manual review'
    ELSE 'Request approved by AI'
  END,
  status = CASE
    WHEN manual_review AND manual_decision = 'declined' THEN 'reached-back'
    WHEN manual_review AND manual_decision = 'approved' THEN 'approved'
    WHEN ai_decision = 'declined' THEN 'refused'
    ELSE 'refused'
  END
WHERE details = '{}' OR details IS NULL;

-- Function to handle triage entry updates (for the admin actions)
CREATE OR REPLACE FUNCTION update_triage_entry_status(
  entry_id UUID,
  new_status TEXT,
  admin_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE student_triage_log
  SET
    manual_review = true,
    manual_decision = CASE
      WHEN new_status = 'reached-back' THEN 'declined'
      WHEN new_status = 'approved' THEN 'approved'
      ELSE manual_decision
    END,
    manual_notes = admin_notes,
    reviewed_by = 'Admin',
    reviewed_at = TIMEZONE('utc', NOW()),
    status = new_status
  WHERE id = entry_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to add new triage entries (for when AI makes decisions)
CREATE OR REPLACE FUNCTION add_triage_entry(
  p_name TEXT,
  p_email TEXT,
  p_purpose TEXT,
  p_ai_decision TEXT,
  p_ai_reasoning TEXT,
  p_phone TEXT DEFAULT NULL,
  p_category TEXT DEFAULT 'student',
  p_ai_confidence DECIMAL DEFAULT 0.8,
  p_reason TEXT DEFAULT NULL,
  p_company TEXT DEFAULT NULL,
  p_school TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  entry_id UUID;
  entry_details JSONB;
BEGIN
  -- Build details object
  entry_details := jsonb_build_object('purpose', p_purpose);

  IF p_company IS NOT NULL THEN
    entry_details := entry_details || jsonb_build_object('company', p_company);
  END IF;

  IF p_school IS NOT NULL THEN
    entry_details := entry_details || jsonb_build_object('school', p_school);
  END IF;

  INSERT INTO student_triage_log (
    student_name,
    student_email,
    student_phone,
    category,
    purpose,
    ai_decision,
    ai_reasoning,
    ai_confidence,
    reason,
    details,
    status,
    submitted_at
  ) VALUES (
    p_name,
    p_email,
    p_phone,
    p_category,
    p_purpose,
    p_ai_decision,
    p_ai_reasoning,
    p_ai_confidence,
    COALESCE(p_reason,
      CASE
        WHEN p_ai_decision = 'declined' THEN 'Request declined by AI filter'
        WHEN p_ai_decision = 'uncertain' THEN 'Request requires manual review'
        ELSE 'Request approved by AI'
      END
    ),
    entry_details,
    CASE
      WHEN p_ai_decision = 'declined' THEN 'refused'
      WHEN p_ai_decision = 'uncertain' THEN 'refused'
      ELSE 'approved'
    END,
    TIMEZONE('utc', NOW())
  ) RETURNING id INTO entry_id;

  RETURN entry_id;
END;
$$ LANGUAGE plpgsql;

-- Database is now completely clean and ready for real AI triage data

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_student_triage_log_category ON student_triage_log(category);
CREATE INDEX IF NOT EXISTS idx_student_triage_log_status ON student_triage_log(status);
CREATE INDEX IF NOT EXISTS idx_student_triage_log_submitted_at ON student_triage_log(submitted_at);

-- Create view for AI accuracy statistics
CREATE OR REPLACE VIEW ai_accuracy_stats AS
WITH triage_analysis AS (
  SELECT
    id,
    ai_decision,
    manual_review,
    manual_decision,
    CASE
      -- AI was correct if:
      -- 1. AI declined and admin either didn't review OR admin also declined (reached-back)
      WHEN ai_decision = 'declined' AND (NOT manual_review OR manual_decision = 'declined') THEN true
      -- 2. AI approved and admin didn't override (no manual review)
      WHEN ai_decision = 'approved' AND NOT manual_review THEN true
      -- 3. AI was uncertain and admin made a decision (we count uncertainty as "needs review" which is correct)
      WHEN ai_decision = 'uncertain' AND manual_review THEN true
      -- AI was wrong if:
      -- 1. AI declined but admin manually approved
      WHEN ai_decision = 'declined' AND manual_review AND manual_decision = 'approved' THEN false
      -- 2. AI approved but should have been declined (rare case, would need manual flag)
      ELSE true -- Default to correct for edge cases
    END as ai_was_correct,
    created_at
  FROM student_triage_log
  WHERE created_at >= NOW() - INTERVAL '30 days' -- Only last 30 days for accuracy
),
accuracy_calculation AS (
  SELECT
    COUNT(*) as total_decisions,
    SUM(CASE WHEN ai_was_correct THEN 1 ELSE 0 END) as correct_decisions,
    CASE
      WHEN COUNT(*) > 0 THEN
        ROUND((SUM(CASE WHEN ai_was_correct THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100, 1)
      ELSE 0
    END as accuracy_percentage
  FROM triage_analysis
)
SELECT
  total_decisions,
  correct_decisions,
  accuracy_percentage,
  -- Additional stats
  (SELECT COUNT(*) FROM student_triage_log WHERE ai_decision = 'declined' AND created_at >= NOW() - INTERVAL '30 days') as total_declined,
  (SELECT COUNT(*) FROM student_triage_log WHERE ai_decision = 'approved' AND created_at >= NOW() - INTERVAL '30 days') as total_approved,
  (SELECT COUNT(*) FROM student_triage_log WHERE ai_decision = 'uncertain' AND created_at >= NOW() - INTERVAL '30 days') as total_uncertain,
  (SELECT COUNT(*) FROM student_triage_log WHERE manual_review = true AND created_at >= NOW() - INTERVAL '30 days') as total_manual_reviews
FROM accuracy_calculation;

-- Create function to get accuracy stats (for easy component access)
CREATE OR REPLACE FUNCTION get_ai_accuracy_stats()
RETURNS TABLE(
  accuracy_percentage DECIMAL,
  total_decisions BIGINT,
  correct_decisions BIGINT,
  total_declined BIGINT,
  total_approved BIGINT,
  total_uncertain BIGINT,
  total_manual_reviews BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.accuracy_percentage,
    s.total_decisions,
    s.correct_decisions,
    s.total_declined,
    s.total_approved,
    s.total_uncertain,
    s.total_manual_reviews
  FROM ai_accuracy_stats s;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT ON ai_triage_entries TO anon, authenticated;
GRANT SELECT ON ai_accuracy_stats TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_triage_entry_status(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION add_triage_entry(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DECIMAL, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_ai_accuracy_stats() TO anon, authenticated;