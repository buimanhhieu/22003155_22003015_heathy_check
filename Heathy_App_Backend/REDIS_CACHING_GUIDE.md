# Hướng Dẫn Sử Dụng Redis Caching

## ✅ Redis đã được cài đặt và chạy

Container ID: `5f218119bea2`
Port: `6379`

## 📋 Các bước tiếp theo

### 1. Start Backend Application

```bash
cd Heathy_App_Backend
mvn spring-boot:run
```

Hoặc nếu đã build:
```bash
java -jar target/Heathy_App_Backend-0.0.1-SNAPSHOT.jar
```

### 2. Kiểm tra kết nối Redis

Khi start backend, kiểm tra log xem có lỗi kết nối Redis không:
- ✅ Nếu thấy: "Started HeathyAppBackendApplication" → Redis đã kết nối thành công
- ❌ Nếu thấy lỗi: "Unable to connect to Redis" → Kiểm tra lại Redis container

### 3. Test Caching

#### Test Dashboard Cache
```bash
# Lần 1: Cache MISS (query từ DB)
GET http://localhost:8080/api/users/14/dashboard
# Log sẽ hiển thị: "[DashboardService] Cache MISS for userId: 14"

# Lần 2: Cache HIT (lấy từ Redis)
GET http://localhost:8080/api/users/14/dashboard
# Log sẽ hiển thị: "[DashboardService] Cache HIT for userId: 14"
```

#### Test Categories Cache
```bash
# Lần 1: Cache MISS
GET http://localhost:8080/api/categories
# Log: "[CategoryController] Cache MISS for categories"

# Lần 2: Cache HIT
GET http://localhost:8080/api/categories
# Log: "[CategoryController] Cache HIT for categories"
```

#### Test Articles Cache
```bash
# Lần 1: Cache MISS
GET http://localhost:8080/api/articles
# Log: "[ArticleService] Cache MISS for articles: articles:all"

# Lần 2: Cache HIT
GET http://localhost:8080/api/articles
# Log: "[ArticleService] Cache HIT for articles: articles:all"
```

### 4. Kiểm tra Redis Data

Có thể dùng Redis CLI để xem cache:

```bash
# Kết nối vào Redis container
docker exec -it 5f218119bea2 redis-cli

# Xem tất cả keys
KEYS *

# Xem value của một key
GET dashboard:14

# Xem TTL (thời gian còn lại)
TTL dashboard:14

# Xóa một key (nếu cần)
DEL dashboard:14

# Xóa tất cả keys (cẩn thận!)
FLUSHALL
```

### 5. Test Cache Invalidation

#### Test Dashboard Cache Invalidation
```bash
# 1. Gọi dashboard → Cache được tạo
GET http://localhost:8080/api/users/14/dashboard

# 2. Update user profile → Cache bị invalidate
PUT http://localhost:8080/api/users/14/profile
{
  "heightCm": 175,
  "weightKg": 70
}

# 3. Gọi dashboard lại → Cache MISS (phải query lại từ DB)
GET http://localhost:8080/api/users/14/dashboard
# Log: "[DashboardService] Cache MISS for userId: 14"
```

#### Test Article Cache Invalidation
```bash
# 1. Gọi articles → Cache được tạo
GET http://localhost:8080/api/articles

# 2. Vote article → Cache bị invalidate
POST http://localhost:8080/api/articles/1/vote

# 3. Gọi articles lại → Cache MISS
GET http://localhost:8080/api/articles
```

## 📊 Monitoring Cache Performance

### Xem cache statistics trong Redis CLI:
```bash
docker exec -it 5f218119bea2 redis-cli

# Xem thông tin server
INFO stats

# Xem số lượng keys
DBSIZE

# Xem memory usage
INFO memory
```

## 🔧 Troubleshooting

### Redis không kết nối được
1. Kiểm tra Redis container đang chạy:
   ```bash
   docker ps | findstr redis
   ```

2. Kiểm tra port 6379 có bị chiếm không:
   ```bash
   netstat -an | findstr 6379
   ```

3. Test kết nối Redis:
   ```bash
   docker exec -it 5f218119bea2 redis-cli ping
   # Nên trả về: PONG
   ```

### Cache không hoạt động
1. Kiểm tra log backend xem có lỗi Redis không
2. Kiểm tra `application.properties` có đúng cấu hình Redis không
3. Kiểm tra Redis container có đang chạy không

### Cache không invalidate
- Đảm bảo các service đã inject `DashboardService` để gọi `invalidateDashboardCache()`
- Kiểm tra log xem có message "Cache invalidated" không

## 📝 Cache Keys Structure

```
dashboard:{userId}                    # Dashboard data
categories:all                        # All categories
category:{id}                         # Single category
articles:all                          # All articles
articles:keyword:{hash}               # Articles by keyword
articles:category:{id}                # Articles by category
articles:detail:{id}:user:{userId}   # Article detail
user:profile:{userId}                 # User profile
user:goals:{userId}                   # User goals
meal-logs:{userId}:{date}             # Meal logs by date
```

## ⏱️ Cache TTL (Time To Live)

- **Dashboard**: 10 phút
- **Categories**: 24 giờ
- **Articles**: 30 phút
- **User Profile/Goals**: 30 phút
- **Meal Logs**: 10 phút

## 🎯 Expected Performance

- **Cache Hit Rate**: 50-80% (sau khi warm up)
- **Response Time Improvement**: 5-10x nhanh hơn
- **Database Load Reduction**: 50-80%

## 🚀 Next Steps

1. Start backend và test các API
2. Monitor cache hit rate trong Redis
3. Điều chỉnh TTL nếu cần
4. Thêm caching cho các endpoint khác nếu cần

