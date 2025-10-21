-- Update User Profile with Complete Information
-- This script ensures user profile has all required fields

-- 1. Check current profile data
SELECT 'Current Profile Data:' as message;
SELECT 
    up.id,
    up.user_id,
    up.username,
    up.email,
    up.date_of_birth,
    up.gender,
    up.height_cm,
    up.weight_kg,
    up.avatar
FROM user_profiles up
WHERE up.user_id = 1;

-- 2. Update user profile with complete information if missing
UPDATE user_profiles 
SET 
    date_of_birth = COALESCE(date_of_birth, '1995-01-01'),
    gender = COALESCE(gender, 'OTHER'),
    height_cm = COALESCE(height_cm, 170.0),
    weight_kg = COALESCE(weight_kg, 65.0),
    updated_at = CURRENT_TIMESTAMP
WHERE user_id = 1 
AND (date_of_birth IS NULL OR gender IS NULL OR height_cm IS NULL OR weight_kg IS NULL);

-- 3. Check updated profile data
SELECT 'Updated Profile Data:' as message;
SELECT 
    up.id,
    up.user_id,
    up.username,
    up.email,
    up.date_of_birth,
    up.gender,
    up.height_cm,
    up.weight_kg,
    up.avatar,
    up.updated_at
FROM user_profiles up
WHERE up.user_id = 1;

-- 4. Verify profile completeness
SELECT 'Profile Completeness Check:' as message;
SELECT 
    CASE 
        WHEN up.date_of_birth IS NOT NULL 
         AND up.gender IS NOT NULL 
         AND up.height_cm IS NOT NULL 
         AND up.weight_kg IS NOT NULL 
        THEN 'COMPLETE'
        ELSE 'INCOMPLETE'
    END as profile_status,
    up.date_of_birth,
    up.gender,
    up.height,
    up.weight
FROM user_profiles up
WHERE up.user_id = 1;

SELECT 'User profile update completed!' as message;
