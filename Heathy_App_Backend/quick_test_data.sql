-- Quick Test Data for Healthy Check App
-- Minimal data needed to test the application

-- 1. Insert Categories
INSERT INTO categories (name) VALUES 
('Sức khỏe tổng quát'),
('Dinh dưỡng'),
('Tập luyện'),
('Giấc ngủ');

-- 2. Insert Test User (password: "123456" hashed with BCrypt)
INSERT INTO users (id, email, password_hash, full_name, created_at, provider, provider_id) VALUES 
(1, 'test@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Test User', NOW(), 'local', 'local_1');

-- 3. Insert User Profile
INSERT INTO user_profiles (user_id, date_of_birth, height_cm, weight_kg, gender) VALUES 
(1, '1990-01-01', 170.0, 70.0, 'Nam');

-- 4. Insert User Goals
INSERT INTO user_goals (user_id, daily_steps_goal, daily_calories_goal, bedtime, wakeup, activity_level) VALUES 
(1, 10000, 2000, '22:00:00', '06:00:00', 'MODERATELY_ACTIVE');

-- 5. Insert Health Data (today and yesterday)
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

-- 6. Insert Meal Logs (today)
INSERT INTO meal_logs (user_id, total_calories, fat_grams, protein_grams, carbs_grams, logged_at) VALUES 
(1, 450, 15.2, 25.8, 35.4, NOW() - INTERVAL '2 hours'),
(1, 320, 8.5, 18.2, 42.1, NOW() - INTERVAL '5 hours'),
(1, 680, 22.1, 35.6, 58.9, NOW() - INTERVAL '8 hours');

-- 7. Insert Sample Articles
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

SELECT 'Quick test data inserted successfully!' as message;
