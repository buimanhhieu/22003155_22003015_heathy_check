-- Quick Test Data for Healthy Check App (FIXED VERSION)
-- Minimal data needed to test the application

-- 1. Clear existing data (optional - uncomment if needed)
-- DELETE FROM articles;
-- DELETE FROM categories;
-- ALTER SEQUENCE categories_id_seq RESTART WITH 1;

-- 2. Insert Categories with explicit IDs
INSERT INTO categories (id, name) VALUES 
(1, 'Sức khỏe tổng quát'),
(2, 'Dinh dưỡng'),
(3, 'Tập luyện'),
(4, 'Giấc ngủ')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. Insert Test User (password: "123456" hashed with BCrypt)
INSERT INTO users (id, email, password_hash, full_name, created_at, provider, provider_id) VALUES 
(1, 'test@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Test User', NOW(), 'local', 'local_1')
ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name;

-- 4. Insert User Profile
INSERT INTO user_profiles (user_id, date_of_birth, height_cm, weight_kg, gender) VALUES 
(1, '1990-01-01', 170.0, 70.0, 'Nam')
ON CONFLICT (user_id) DO UPDATE SET 
    date_of_birth = EXCLUDED.date_of_birth,
    height_cm = EXCLUDED.height_cm,
    weight_kg = EXCLUDED.weight_kg,
    gender = EXCLUDED.gender;

-- 5. Insert User Goals
INSERT INTO user_goals (user_id, daily_steps_goal, daily_calories_goal, bedtime, wakeup, activity_level) VALUES 
(1, 10000, 2000, '22:00:00', '06:00:00', 'MODERATELY_ACTIVE')
ON CONFLICT (user_id) DO UPDATE SET 
    daily_steps_goal = EXCLUDED.daily_steps_goal,
    daily_calories_goal = EXCLUDED.daily_calories_goal,
    bedtime = EXCLUDED.bedtime,
    wakeup = EXCLUDED.wakeup,
    activity_level = EXCLUDED.activity_level;

-- 6. Insert Health Data (today and yesterday)
INSERT INTO health_data_entries (user_id, metric_type, value, unit, recorded_at) VALUES 
-- Today's data
(1, 'STEPS', 8500, 'steps', NOW()),
(1, 'SLEEP_DURATION', 7.5, 'hours', NOW() - INTERVAL '8 hours'),
(1, 'WATER_INTAKE', 2.5, 'liters', NOW()),
(1, 'WORKOUT_DURATION', 45, 'minutes', NOW() - INTERVAL '2 hours'),
(1, 'HEART_RATE', 72, 'bpm', NOW()),

-- Yesterday's data
(1, 'STEPS', 9200, 'steps', NOW() - INTERVAL '1 day'),
(1, 'SLEEP_DURATION', 8.0, 'hours', NOW() - INTERVAL '1 day' - INTERVAL '8 hours'),
(1, 'WATER_INTAKE', 3.0, 'liters', NOW() - INTERVAL '1 day'),
(1, 'WORKOUT_DURATION', 60, 'minutes', NOW() - INTERVAL '1 day' - INTERVAL '2 hours'),
(1, 'HEART_RATE', 68, 'bpm', NOW() - INTERVAL '1 day');

-- 7. Insert Meal Logs (today)
INSERT INTO meal_logs (user_id, total_calories, fat_grams, protein_grams, carbs_grams, logged_at) VALUES 
(1, 450, 15.2, 25.8, 35.4, NOW() - INTERVAL '2 hours'),
(1, 320, 8.5, 18.2, 42.1, NOW() - INTERVAL '5 hours'),
(1, 680, 22.1, 35.6, 58.9, NOW() - INTERVAL '8 hours');

-- 8. Insert Sample Articles
INSERT INTO articles (title, content, category_id, vote_count, published_at) VALUES 
('Lợi ích của việc uống đủ nước', 
'Uống đủ nước giúp cơ thể hoạt động hiệu quả, hỗ trợ tiêu hóa, và giữ cho làn da khỏe mạnh. Hãy uống ít nhất 2-3 lít nước mỗi ngày để duy trì sức khỏe tốt.', 
1, 10, NOW() - INTERVAL '1 day'),

('Tập luyện tại nhà hiệu quả', 
'Bạn có thể tập luyện hiệu quả ngay tại nhà với các bài tập đơn giản. Chỉ cần 30 phút mỗi ngày để cải thiện sức khỏe và vóc dáng.', 
2, 15, NOW() - INTERVAL '2 days'),

('Bí quyết ngủ ngon', 
'Giấc ngủ chất lượng là nền tảng của sức khỏe tốt. Hãy tạo thói quen ngủ đúng giờ và tránh sử dụng thiết bị điện tử trước khi ngủ.', 
3, 12, NOW() - INTERVAL '3 days');

-- 9. Verify data
SELECT 'Data verification:' as message;
SELECT 'Categories:' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Users:', COUNT(*) FROM users
UNION ALL
SELECT 'Health Data:', COUNT(*) FROM health_data_entries
UNION ALL
SELECT 'Meal Logs:', COUNT(*) FROM meal_logs
UNION ALL
SELECT 'Articles:', COUNT(*) FROM articles;

SELECT 'Quick test data inserted successfully!' as message;


