-- Check User Profile Data
-- This script checks if user profile data exists and is complete

-- 1. Check user profile data
SELECT 'User Profile Data:' as message;
SELECT 
    up.id,
    up.user_id,
    up.username,
    up.email,
    up.date_of_birth,
    up.gender,
    up.height,
    up.weight,
    up.avatar,
    up.created_at,
    up.updated_at
FROM user_profiles up
WHERE up.user_id = 1;

-- 2. Check user goals data
SELECT 'User Goals Data:' as message;
SELECT 
    ug.id,
    ug.user_id,
    ug.activity_level,
    ug.bedtime,
    ug.calorie_goal,
    ug.step_goal,
    ug.wake_up_time,
    ug.created_at,
    ug.updated_at
FROM user_goals ug
WHERE ug.user_id = 1;

-- 3. Check if profile is complete (has date_of_birth)
SELECT 'Profile Completeness Check:' as message;
SELECT 
    CASE 
        WHEN up.date_of_birth IS NOT NULL THEN 'COMPLETE'
        ELSE 'INCOMPLETE'
    END as profile_status,
    up.date_of_birth,
    up.gender,
    up.height,
    up.weight
FROM user_profiles up
WHERE up.user_id = 1;

-- 4. Check all users and their profile status
SELECT 'All Users Profile Status:' as message;
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    CASE 
        WHEN up.date_of_birth IS NOT NULL THEN 'COMPLETE'
        ELSE 'INCOMPLETE'
    END as profile_status,
    up.date_of_birth,
    up.gender,
    up.height,
    up.weight
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
ORDER BY u.id;






