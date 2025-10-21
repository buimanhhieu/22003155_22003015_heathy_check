-- Fix Duplicate Data Script for Healthy Check App
-- This will remove duplicate health data entries

-- 1. Check for duplicate health data entries
SELECT 'Checking for duplicate health data entries...' as message;
SELECT 
    user_id, 
    metric_type, 
    recorded_at, 
    COUNT(*) as duplicate_count
FROM health_data_entries 
GROUP BY user_id, metric_type, recorded_at 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 2. Remove duplicate entries, keeping only the latest one (highest ID)
WITH duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY user_id, metric_type, recorded_at 
            ORDER BY id DESC
        ) as rn
    FROM health_data_entries
)
DELETE FROM health_data_entries 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- 3. Check for remaining duplicates
SELECT 'Checking for remaining duplicates...' as message;
SELECT 
    user_id, 
    metric_type, 
    recorded_at, 
    COUNT(*) as duplicate_count
FROM health_data_entries 
GROUP BY user_id, metric_type, recorded_at 
HAVING COUNT(*) > 1;

-- 4. Show current health data summary
SELECT 'Current health data summary:' as message;
SELECT 
    metric_type,
    COUNT(*) as total_entries,
    COUNT(DISTINCT user_id) as unique_users,
    MIN(recorded_at) as earliest_record,
    MAX(recorded_at) as latest_record
FROM health_data_entries 
GROUP BY metric_type
ORDER BY metric_type;

-- 5. Show sleep data specifically (the problematic one)
SELECT 'Sleep data entries:' as message;
SELECT 
    id,
    user_id,
    value,
    unit,
    recorded_at
FROM health_data_entries 
WHERE metric_type = 'SLEEP_DURATION'
ORDER BY user_id, recorded_at DESC;

SELECT 'Duplicate data cleanup completed!' as message;
