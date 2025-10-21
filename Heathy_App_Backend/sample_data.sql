-- Sample Data for Healthy Check App
-- Run this script after creating the database schema

-- 1. Insert Categories
INSERT INTO categories (name) VALUES 
('Sức khỏe tổng quát'),
('Dinh dưỡng'),
('Tập luyện'),
('Giấc ngủ'),
('Tâm lý'),
('Phụ nữ');

-- 2. Insert Sample User (password: "password123" hashed with BCrypt)
INSERT INTO users (id, email, password_hash, full_name, created_at, provider, provider_id) VALUES 
(1, 'test@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Nguyễn Văn A', NOW(), 'local', 'local_1'),
(2, 'user2@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi', 'Trần Thị B', NOW(), 'local', 'local_2');

-- 3. Insert User Profiles
INSERT INTO user_profiles (user_id, date_of_birth, height_cm, weight_kg, gender) VALUES 
(1, '1990-05-15', 170.0, 65.0, 'Nam'),
(2, '1995-08-22', 160.0, 55.0, 'Nữ');

-- 4. Insert User Goals
INSERT INTO user_goals (user_id, daily_steps_goal, daily_calories_goal, bedtime, wakeup, activity_level) VALUES 
(1, 10000, 2200, '22:30:00', '06:30:00', 'MODERATELY_ACTIVE'),
(2, 8000, 1800, '23:00:00', '07:00:00', 'LIGHTLY_ACTIVE');

-- 5. Insert Health Data Entries (last 7 days)
-- User 1 - Steps data
INSERT INTO health_data_entries (user_id, metric_type, value, unit, recorded_at) VALUES 
(1, 'STEPS', 8500, 'steps', NOW() - INTERVAL '1 day'),
(1, 'STEPS', 9200, 'steps', NOW() - INTERVAL '2 days'),
(1, 'STEPS', 11000, 'steps', NOW() - INTERVAL '3 days'),
(1, 'STEPS', 7800, 'steps', NOW() - INTERVAL '4 days'),
(1, 'STEPS', 9500, 'steps', NOW() - INTERVAL '5 days'),
(1, 'STEPS', 12000, 'steps', NOW() - INTERVAL '6 days'),
(1, 'STEPS', 8800, 'steps', NOW() - INTERVAL '7 days');

-- User 1 - Sleep data
INSERT INTO health_data_entries (user_id, metric_type, value, unit, recorded_at) VALUES 
(1, 'SLEEP_DURATION', 7.5, 'hours', NOW() - INTERVAL '1 day'),
(1, 'SLEEP_DURATION', 8.0, 'hours', NOW() - INTERVAL '2 days'),
(1, 'SLEEP_DURATION', 7.0, 'hours', NOW() - INTERVAL '3 days'),
(1, 'SLEEP_DURATION', 8.5, 'hours', NOW() - INTERVAL '4 days'),
(1, 'SLEEP_DURATION', 7.2, 'hours', NOW() - INTERVAL '5 days'),
(1, 'SLEEP_DURATION', 6.8, 'hours', NOW() - INTERVAL '6 days'),
(1, 'SLEEP_DURATION', 7.8, 'hours', NOW() - INTERVAL '7 days');

-- User 1 - Water intake
INSERT INTO health_data_entries (user_id, metric_type, value, unit, recorded_at) VALUES 
(1, 'WATER_INTAKE', 2.5, 'liters', NOW() - INTERVAL '1 day'),
(1, 'WATER_INTAKE', 3.0, 'liters', NOW() - INTERVAL '2 days'),
(1, 'WATER_INTAKE', 2.8, 'liters', NOW() - INTERVAL '3 days'),
(1, 'WATER_INTAKE', 3.2, 'liters', NOW() - INTERVAL '4 days'),
(1, 'WATER_INTAKE', 2.6, 'liters', NOW() - INTERVAL '5 days'),
(1, 'WATER_INTAKE', 3.1, 'liters', NOW() - INTERVAL '6 days'),
(1, 'WATER_INTAKE', 2.9, 'liters', NOW() - INTERVAL '7 days');

-- User 1 - Workout duration
INSERT INTO health_data_entries (user_id, metric_type, value, unit, recorded_at) VALUES 
(1, 'WORKOUT_DURATION', 45, 'minutes', NOW() - INTERVAL '1 day'),
(1, 'WORKOUT_DURATION', 60, 'minutes', NOW() - INTERVAL '2 days'),
(1, 'WORKOUT_DURATION', 30, 'minutes', NOW() - INTERVAL '3 days'),
(1, 'WORKOUT_DURATION', 90, 'minutes', NOW() - INTERVAL '4 days'),
(1, 'WORKOUT_DURATION', 0, 'minutes', NOW() - INTERVAL '5 days'),
(1, 'WORKOUT_DURATION', 75, 'minutes', NOW() - INTERVAL '6 days'),
(1, 'WORKOUT_DURATION', 50, 'minutes', NOW() - INTERVAL '7 days');

-- User 1 - Heart rate
INSERT INTO health_data_entries (user_id, metric_type, value, unit, recorded_at) VALUES 
(1, 'HEART_RATE', 72, 'bpm', NOW() - INTERVAL '1 day'),
(1, 'HEART_RATE', 68, 'bpm', NOW() - INTERVAL '2 days'),
(1, 'HEART_RATE', 75, 'bpm', NOW() - INTERVAL '3 days'),
(1, 'HEART_RATE', 70, 'bpm', NOW() - INTERVAL '4 days'),
(1, 'HEART_RATE', 73, 'bpm', NOW() - INTERVAL '5 days'),
(1, 'HEART_RATE', 69, 'bpm', NOW() - INTERVAL '6 days'),
(1, 'HEART_RATE', 71, 'bpm', NOW() - INTERVAL '7 days');

-- User 2 - Similar data
INSERT INTO health_data_entries (user_id, metric_type, value, unit, recorded_at) VALUES 
(2, 'STEPS', 6500, 'steps', NOW() - INTERVAL '1 day'),
(2, 'STEPS', 7200, 'steps', NOW() - INTERVAL '2 days'),
(2, 'STEPS', 8000, 'steps', NOW() - INTERVAL '3 days'),
(2, 'SLEEP_DURATION', 8.0, 'hours', NOW() - INTERVAL '1 day'),
(2, 'SLEEP_DURATION', 7.5, 'hours', NOW() - INTERVAL '2 days'),
(2, 'SLEEP_DURATION', 8.2, 'hours', NOW() - INTERVAL '3 days'),
(2, 'WATER_INTAKE', 2.0, 'liters', NOW() - INTERVAL '1 day'),
(2, 'WATER_INTAKE', 2.3, 'liters', NOW() - INTERVAL '2 days'),
(2, 'WATER_INTAKE', 2.1, 'liters', NOW() - INTERVAL '3 days');

-- 6. Insert Meal Logs (last 3 days)
INSERT INTO meal_logs (user_id, total_calories, fat_grams, protein_grams, carbs_grams, logged_at) VALUES 
-- User 1 - Today
(1, 450, 15.2, 25.8, 35.4, NOW() - INTERVAL '2 hours'),
(1, 320, 8.5, 18.2, 42.1, NOW() - INTERVAL '5 hours'),
(1, 680, 22.1, 35.6, 58.9, NOW() - INTERVAL '8 hours'),

-- User 1 - Yesterday
(1, 420, 12.8, 22.5, 38.2, NOW() - INTERVAL '1 day' - INTERVAL '2 hours'),
(1, 380, 10.2, 20.1, 45.6, NOW() - INTERVAL '1 day' - INTERVAL '6 hours'),
(1, 720, 28.5, 42.3, 65.8, NOW() - INTERVAL '1 day' - INTERVAL '10 hours'),

-- User 1 - Day before yesterday
(1, 480, 16.5, 28.9, 41.2, NOW() - INTERVAL '2 days' - INTERVAL '1 hour'),
(1, 350, 9.8, 19.5, 48.7, NOW() - INTERVAL '2 days' - INTERVAL '5 hours'),
(1, 650, 24.2, 38.1, 52.3, NOW() - INTERVAL '2 days' - INTERVAL '9 hours'),

-- User 2 - Today
(2, 380, 12.5, 20.8, 32.1, NOW() - INTERVAL '1 hour'),
(2, 280, 6.8, 15.2, 38.5, NOW() - INTERVAL '4 hours'),
(2, 520, 18.9, 28.4, 45.2, NOW() - INTERVAL '7 hours');

-- 7. Insert Articles
INSERT INTO articles (title, content, category_id, vote_count, published_at) VALUES 
('10 Lợi ích của việc uống đủ nước mỗi ngày', 
'Uống đủ nước là một trong những thói quen quan trọng nhất để duy trì sức khỏe tốt. Nước giúp cơ thể hoạt động hiệu quả, hỗ trợ tiêu hóa, và giữ cho làn da khỏe mạnh. Hãy cùng tìm hiểu 10 lợi ích quan trọng của việc uống đủ nước...', 
1, 15, NOW() - INTERVAL '1 day'),

('Cách tập luyện hiệu quả tại nhà trong 30 phút', 
'Bạn không cần phải đến phòng gym để có một buổi tập hiệu quả. Với 30 phút mỗi ngày và một số bài tập đơn giản, bạn có thể cải thiện sức khỏe và vóc dáng ngay tại nhà...', 
2, 23, NOW() - INTERVAL '2 days'),

('Bí quyết có giấc ngủ ngon và sâu', 
'Giấc ngủ chất lượng là nền tảng của sức khỏe tốt. Hãy khám phá những bí quyết đơn giản để có giấc ngủ ngon và sâu, giúp cơ thể phục hồi và tái tạo năng lượng...', 
3, 18, NOW() - INTERVAL '3 days'),

('Dinh dưỡng cân bằng cho người bận rộn', 
'Cuộc sống bận rộn không có nghĩa là bạn phải hy sinh dinh dưỡng. Hãy học cách lên kế hoạch bữa ăn và chọn thực phẩm phù hợp để duy trì chế độ ăn lành mạnh...', 
1, 12, NOW() - INTERVAL '4 days'),

('Quản lý stress và cải thiện tâm lý', 
'Stress là một phần không thể tránh khỏi trong cuộc sống hiện đại. Tuy nhiên, chúng ta có thể học cách quản lý stress hiệu quả để bảo vệ sức khỏe tinh thần...', 
4, 20, NOW() - INTERVAL '5 days'),

('Chăm sóc sức khỏe phụ nữ theo từng độ tuổi', 
'Sức khỏe phụ nữ có những đặc thù riêng và cần được chăm sóc phù hợp theo từng giai đoạn cuộc đời. Hãy tìm hiểu cách chăm sóc sức khỏe toàn diện...', 
5, 16, NOW() - INTERVAL '6 days');

-- 8. Insert Menstrual Cycle data (for female user)
INSERT INTO menstrual_cycles (user_id, cycle_start_date, cycle_length, period_length, symptoms, notes, created_at) VALUES 
(2, CURRENT_DATE - INTERVAL '15 days', 28, 5, 'Mild cramps, mood swings', 'Normal cycle', NOW() - INTERVAL '15 days'),
(2, CURRENT_DATE - INTERVAL '43 days', 28, 4, 'Heavy flow, fatigue', 'Stressful period', NOW() - INTERVAL '43 days'),
(2, CURRENT_DATE - INTERVAL '71 days', 30, 5, 'Mild symptoms', 'Regular cycle', NOW() - INTERVAL '71 days');

-- 9. Insert Daily Symptoms (for tracking)
INSERT INTO daily_symptoms (user_id, symptom_date, symptoms, severity, notes, created_at) VALUES 
(1, CURRENT_DATE - INTERVAL '1 day', 'Headache, fatigue', 'MILD', 'Work stress', NOW() - INTERVAL '1 day'),
(1, CURRENT_DATE - INTERVAL '2 days', 'None', 'NONE', 'Feeling great', NOW() - INTERVAL '2 days'),
(2, CURRENT_DATE - INTERVAL '1 day', 'Mood swings, cramps', 'MODERATE', 'Pre-menstrual', NOW() - INTERVAL '1 day'),
(2, CURRENT_DATE - INTERVAL '2 days', 'Bloating', 'MILD', 'Hormonal changes', NOW() - INTERVAL '2 days');

-- 10. Insert Data Sharing Permissions (example)
INSERT INTO data_sharing_permissions (sharer_user_id, recipient_email, permission_level, status, created_at) VALUES 
(1, 'doctor@example.com', 'FULL_ACCESS', 'PENDING', NOW() - INTERVAL '1 day'),
(2, 'family@example.com', 'READ_ONLY', 'APPROVED', NOW() - INTERVAL '2 days');

-- 11. Insert Article Votes (example)
INSERT INTO article_votes (user_id, article_id, vote_type, created_at) VALUES 
(1, 1, 'UP', NOW() - INTERVAL '1 day'),
(1, 2, 'UP', NOW() - INTERVAL '2 days'),
(2, 1, 'UP', NOW() - INTERVAL '1 day'),
(2, 3, 'UP', NOW() - INTERVAL '3 days');

-- Update vote counts
UPDATE articles SET vote_count = (
    SELECT COUNT(*) FROM article_votes 
    WHERE article_votes.article_id = articles.id AND vote_type = 'UP'
) - (
    SELECT COUNT(*) FROM article_votes 
    WHERE article_votes.article_id = articles.id AND vote_type = 'DOWN'
);

-- Show summary
SELECT 'Sample data inserted successfully!' as message;
SELECT 'Users created: ' || COUNT(*) as users FROM users;
SELECT 'Health entries: ' || COUNT(*) as health_entries FROM health_data_entries;
SELECT 'Meal logs: ' || COUNT(*) as meal_logs FROM meal_logs;
SELECT 'Articles: ' || COUNT(*) as articles FROM articles;
