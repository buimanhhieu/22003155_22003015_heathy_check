-- Debug Profile API Response
-- This script helps debug what the profile API should return

-- 1. Check user profile data that API should return
SELECT 'Profile API Response Data:' as message;
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

-- 2. Check if all required fields are present
SELECT 'Required Fields Check:' as message;
SELECT 
    'date_of_birth' as field_name,
    CASE WHEN up.date_of_birth IS NOT NULL THEN 'PRESENT' ELSE 'MISSING' END as status,
    up.date_of_birth as value
FROM user_profiles up WHERE up.user_id = 1
UNION ALL
SELECT 
    'gender' as field_name,
    CASE WHEN up.gender IS NOT NULL THEN 'PRESENT' ELSE 'MISSING' END as status,
    up.gender::text as value
FROM user_profiles up WHERE up.user_id = 1
UNION ALL
SELECT 
    'height' as field_name,
    CASE WHEN up.height IS NOT NULL THEN 'PRESENT' ELSE 'MISSING' END as status,
    up.height::text as value
FROM user_profiles up WHERE up.user_id = 1
UNION ALL
SELECT 
    'weight' as field_name,
    CASE WHEN up.weight IS NOT NULL THEN 'PRESENT' ELSE 'MISSING' END as status,
    up.weight::text as value
FROM user_profiles up WHERE up.user_id = 1;

-- 3. Check user goals data
SELECT 'User Goals Data:' as message;
SELECT 
    ug.id,
    ug.user_id,
    ug.activity_level,
    ug.bedtime,
    ug.calorie_goal,
    ug.step_goal,
    ug.wake_up_time
FROM user_goals ug
WHERE ug.user_id = 1;

-- 4. Summary
SELECT 'Summary:' as message;
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    CASE 
        WHEN up.date_of_birth IS NOT NULL 
         AND up.gender IS NOT NULL 
         AND up.height IS NOT NULL 
         AND up.weight IS NOT NULL 
        THEN 'PROFILE_COMPLETE'
        ELSE 'PROFILE_INCOMPLETE'
    END as profile_status,
    CASE 
        WHEN ug.id IS NOT NULL THEN 'GOALS_EXIST'
        ELSE 'GOALS_MISSING'
    END as goals_status
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN user_goals ug ON u.id = ug.user_id
WHERE u.id = 1;






