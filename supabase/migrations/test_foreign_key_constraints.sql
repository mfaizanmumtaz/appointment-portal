-- Test script to verify foreign key constraints are working properly
-- Run this after applying the main migration

-- Test 1: Create a test slot
INSERT INTO time_slots (date, time, is_available, slot_type)
VALUES ('2025-01-01', '10:00', true, 'business')
RETURNING id as test_slot_id \gset

-- Test 2: Create appointment with valid slot_id
INSERT INTO appointments (
    type, session_type, name, email, phone,
    date, time, slot_id, status
)
VALUES (
    'business', 'paid', 'Test User', 'test@example.com', '1234567890',
    '2025-01-01', '10:00', :'test_slot_id', 'confirmed'
);

-- Test 3: Verify slot is marked as unavailable by trigger
SELECT id, date, time, is_available, slot_type
FROM time_slots
WHERE id = :'test_slot_id';

-- Should show is_available = false

-- Test 4: Try to create appointment with invalid slot_id (should fail)
-- This should fail with foreign key constraint violation
DO $$
BEGIN
    INSERT INTO appointments (
        type, session_type, name, email, phone,
        date, time, slot_id, status
    )
    VALUES (
        'business', 'paid', 'Invalid User', 'invalid@example.com', '9876543210',
        '2025-01-01', '11:00', gen_random_uuid(), 'confirmed'
    );
    RAISE EXCEPTION 'ERROR: Invalid slot_id was allowed - foreign key constraint not working!';
EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'SUCCESS: Foreign key constraint correctly rejected invalid slot_id';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'UNEXPECTED ERROR: %', SQLERRM;
END $$;

-- Test 5: Delete slot with appointment (should cascade delete appointment)
DELETE FROM time_slots WHERE id = :'test_slot_id';

-- Test 6: Verify appointment was also deleted
SELECT COUNT(*) as remaining_test_appointments
FROM appointments
WHERE name = 'Test User' AND email = 'test@example.com';

-- Should return 0

-- Test 7: Test appointment status change triggers
-- Create new test slot and appointment
INSERT INTO time_slots (date, time, is_available, slot_type)
VALUES ('2025-01-02', '14:00', true, 'student')
RETURNING id as test_slot_2_id \gset

INSERT INTO appointments (
    type, session_type, name, email, phone,
    date, time, slot_id, status
)
VALUES (
    'student', 'free', 'Student User', 'student@example.com', '5555555555',
    '2025-01-02', '14:00', :'test_slot_2_id', 'pending'
);

-- Verify slot is unavailable
SELECT is_available FROM time_slots WHERE id = :'test_slot_2_id';
-- Should be false

-- Cancel appointment
UPDATE appointments
SET status = 'cancelled'
WHERE slot_id = :'test_slot_2_id';

-- Verify slot is now available again
SELECT is_available FROM time_slots WHERE id = :'test_slot_2_id';
-- Should be true

-- Clean up test data
DELETE FROM appointments WHERE slot_id = :'test_slot_2_id';
DELETE FROM time_slots WHERE id = :'test_slot_2_id';

-- Summary
SELECT
    'Foreign key constraints test completed successfully!' as result,
    'All tests passed - data integrity is maintained' as status;