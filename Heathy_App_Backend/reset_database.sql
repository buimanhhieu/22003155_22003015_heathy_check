-- Reset Database Script for Healthy Check App
-- This will clear all data and reset sequences

-- 1. Disable foreign key checks temporarily
SET session_replication_role = replica;

-- 2. Delete all data in correct order (child tables first)
DELETE FROM article_votes;
DELETE FROM articles;
DELETE FROM daily_symptoms;
DELETE FROM menstrual_cycles;
DELETE FROM data_sharing_permissions;
DELETE FROM meal_logs;
DELETE FROM health_data_entries;
DELETE FROM user_goals;
DELETE FROM user_profiles;
DELETE FROM users;
DELETE FROM categories;

-- 3. Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE articles_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE health_data_entries_id_seq RESTART WITH 1;
ALTER SEQUENCE meal_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE daily_symptoms_id_seq RESTART WITH 1;
ALTER SEQUENCE menstrual_cycles_id_seq RESTART WITH 1;
ALTER SEQUENCE data_sharing_permissions_id_seq RESTART WITH 1;
ALTER SEQUENCE article_votes_id_seq RESTART WITH 1;

-- 4. Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- 5. Verify tables are empty
SELECT 'Database reset completed. Current data:' as message;
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Categories:', COUNT(*) FROM categories
UNION ALL
SELECT 'Articles:', COUNT(*) FROM articles
UNION ALL
SELECT 'Health Data:', COUNT(*) FROM health_data_entries
UNION ALL
SELECT 'Meal Logs:', COUNT(*) FROM meal_logs;

SELECT 'Database is now clean and ready for new data!' as message;






