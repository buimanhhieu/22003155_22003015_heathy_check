# Hướng dẫn thêm dữ liệu mẫu cho Healthy Check App

## Cách chạy dữ liệu mẫu

### 1. Dữ liệu đầy đủ (Khuyến nghị)
```bash
# Kết nối đến PostgreSQL database
psql -h localhost -U postgres -d healthy_check

# Chạy script dữ liệu đầy đủ
\i sample_data.sql
```

### 2. Dữ liệu nhanh (Để test nhanh)
```bash
# Kết nối đến PostgreSQL database
psql -h localhost -U postgres -d healthy_check

# Chạy script dữ liệu nhanh
\i quick_test_data.sql
```

## Thông tin tài khoản test

### Tài khoản chính
- **Email**: test@example.com
- **Password**: 123456
- **Tên**: Test User

### Tài khoản phụ (nếu dùng sample_data.sql)
- **Email**: user2@example.com
- **Password**: 123456
- **Tên**: Trần Thị B

### Activity Levels được sử dụng
- `SEDENTARY` - Ít vận động
- `LIGHTLY_ACTIVE` - Vận động nhẹ  
- `MODERATELY_ACTIVE` - Vận động vừa phải
- `VERY_ACTIVE` - Vận động nhiều
- `EXTRA_ACTIVE` - Rất nặng

### Category Mapping
- ID 1: Sức khỏe tổng quát / Dinh dưỡng
- ID 2: Tập luyện  
- ID 3: Giấc ngủ
- ID 4: Tâm lý
- ID 5: Phụ nữ

## Dữ liệu được tạo

### 1. Users & Profiles
- 1-2 tài khoản test với thông tin profile đầy đủ
- Mục tiêu sức khỏe cá nhân

### 2. Health Data
- Dữ liệu bước chân (steps) 7 ngày
- Dữ liệu giấc ngủ (sleep duration) 7 ngày
- Dữ liệu nước uống (water intake) 7 ngày
- Dữ liệu tập luyện (workout duration) 7 ngày
- Dữ liệu nhịp tim (heart rate) 7 ngày

### 3. Nutrition Data
- Meal logs cho 3 ngày gần nhất
- Thông tin calories, protein, carbs, fat

### 4. Articles
- 3-6 bài viết mẫu về sức khỏe
- Phân loại theo categories khác nhau
- Có vote counts

### 5. Additional Data (sample_data.sql only)
- Menstrual cycle data (cho user nữ)
- Daily symptoms tracking
- Data sharing permissions
- Article votes

## Kiểm tra dữ liệu

```sql
-- Kiểm tra users
SELECT * FROM users;

-- Kiểm tra health data
SELECT metric_type, COUNT(*), AVG(value) 
FROM health_data_entries 
GROUP BY metric_type;

-- Kiểm tra meal logs
SELECT DATE(logged_at), SUM(total_calories) 
FROM meal_logs 
GROUP BY DATE(logged_at) 
ORDER BY DATE(logged_at) DESC;

-- Kiểm tra articles
SELECT title, vote_count, published_at 
FROM articles 
ORDER BY published_at DESC;
```

## Lưu ý

1. **Password**: Tất cả tài khoản test đều có password là `123456`
2. **Timestamps**: Dữ liệu được tạo với timestamps gần đây để test dashboard
3. **Relationships**: Tất cả foreign keys đã được thiết lập đúng
4. **Data Types**: Dữ liệu phù hợp với các enum và constraints trong database

## Troubleshooting

Nếu gặp lỗi khi chạy script:

1. **Kiểm tra database connection**:
   ```bash
   psql -h localhost -U postgres -d healthy_check -c "SELECT version();"
   ```

2. **Kiểm tra tables đã tồn tại**:
   ```sql
   \dt
   ```

3. **Xóa dữ liệu cũ nếu cần**:
   ```sql
   DELETE FROM health_data_entries;
   DELETE FROM meal_logs;
   DELETE FROM articles;
   DELETE FROM user_profiles;
   DELETE FROM user_goals;
   DELETE FROM users;
   DELETE FROM categories;
   ```

4. **Reset auto-increment IDs**:
   ```sql
   ALTER SEQUENCE users_id_seq RESTART WITH 1;
   ALTER SEQUENCE articles_id_seq RESTART WITH 1;
   ALTER SEQUENCE categories_id_seq RESTART WITH 1;
   ```
