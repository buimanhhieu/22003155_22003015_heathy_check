-- Quick Fix Profile Data
-- This script quickly fixes user profile data

-- 1. Check current profile
SELECT 'Current Profile:' as message;
SELECT 
    up.user_id,
    up.date_of_birth,
    up.gender,
    up.height_cm,
    up.weight_kg
FROM user_profiles up
WHERE up.user_id = 1;

-- 2. Insert or update profile with complete data
INSERT INTO user_profiles (user_id, date_of_birth, gender, height_cm, weight_kg, created_at, updated_at)
VALUES (1, '1995-01-01', 'OTHER', 170.0, 65.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (user_id) 
DO UPDATE SET 
    date_of_birth = COALESCE(user_profiles.date_of_birth, '1995-01-01'),
    gender = COALESCE(user_profiles.gender, 'OTHER'),
    height_cm = COALESCE(user_profiles.height_cm, 170.0),
    weight_kg = COALESCE(user_profiles.weight_kg, 65.0),
    updated_at = CURRENT_TIMESTAMP;

-- 3. Verify updated profile
SELECT 'Updated Profile:' as message;
SELECT 
    up.user_id,
    up.date_of_birth,
    up.gender,
    up.height_cm,
    up.weight_kg
FROM user_profiles up
WHERE up.user_id = 1;

SELECT 'Profile fix completed!' as message;


