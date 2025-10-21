-- Debug and Fix Script for Healthy Check App
-- Run this before running sample data

-- 1. Check if categories table exists and has data
SELECT 'Checking categories table...' as message;
SELECT COUNT(*) as category_count FROM categories;
SELECT * FROM categories ORDER BY id;

-- 2. Check if there are any existing articles
SELECT 'Checking articles table...' as message;
SELECT COUNT(*) as article_count FROM articles;

-- 3. Clear existing data if needed (uncomment if you want to reset)
-- DELETE FROM articles;
-- DELETE FROM categories;
-- ALTER SEQUENCE categories_id_seq RESTART WITH 1;

-- 4. Insert categories with explicit IDs to avoid auto-increment issues
INSERT INTO categories (id, name) VALUES 
(1, 'Sức khỏe tổng quát'),
(2, 'Dinh dưỡng'),
(3, 'Tập luyện'),
(4, 'Giấc ngủ')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 5. Verify categories were inserted
SELECT 'Categories after insert:' as message;
SELECT * FROM categories ORDER BY id;

-- 6. Now insert articles
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

-- 7. Verify articles were inserted
SELECT 'Articles after insert:' as message;
SELECT id, title, category_id FROM articles ORDER BY id;

SELECT 'Debug script completed successfully!' as message;
