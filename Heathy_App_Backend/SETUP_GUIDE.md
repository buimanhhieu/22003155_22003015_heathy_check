# Hướng Dẫn Setup Backend cho Teammate

## 📋 Yêu Cầu Hệ Thống

- **Java**: JDK 21 hoặc cao hơn
- **Maven**: 3.6+ 
- **PostgreSQL**: 14+ (hoặc version tương thích)
- **Redis**: 6.0+ (hoặc Docker để chạy Redis)
- **IDE**: IntelliJ IDEA / Eclipse / VS Code (tùy chọn)

---

## 🚀 Các Bước Setup

### **Bước 1: Clone/Pull Code**

```bash
# Nếu chưa có repo, clone:
git clone <repository-url>
cd Heathy_App_Backend

# Nếu đã có repo, pull code mới nhất:
git pull origin main
```

---

### **Bước 2: Cài Đặt và Chạy Redis**

#### **Option 1: Dùng Docker (Khuyến nghị)**

```bash
# Chạy Redis container
docker run -d -p 6379:6379 --name redis-healthy-app redis:latest

# Kiểm tra Redis đang chạy
docker ps | grep redis

# Test kết nối Redis
docker exec -it redis-healthy-app redis-cli ping
# Kết quả mong đợi: PONG
```

#### **Option 2: Cài Đặt Redis Trực Tiếp**

**Windows:**
- Download từ: https://github.com/microsoftarchive/redis/releases
- Hoặc dùng WSL2 và cài Redis trong WSL

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install redis-server

# Mac (với Homebrew)
brew install redis
brew services start redis

# Kiểm tra
redis-cli ping
```

---

### **Bước 3: Cấu Hình Database và Application**

#### **3.1. Tạo Database PostgreSQL**

```sql
-- Kết nối PostgreSQL
psql -U postgres

-- Tạo database
CREATE DATABASE healthy_check;

-- Kiểm tra
\l
```

#### **3.2. Cấu Hình application.properties**

Mở file: `src/main/resources/application.properties`

Kiểm tra và cập nhật các thông tin sau nếu cần:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/healthy_check
spring.datasource.username=postgres
spring.datasource.password=root  # Thay đổi password của bạn

# Redis Configuration (nếu khác localhost:6379)
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.password=  # Để trống nếu không có password

# Gemini API Configuration (nếu cần thay đổi)
app.gemini.api-key=AIzaSyBxbtM3zh7PO696uzbT9AyoiRolQa4Esfg
app.gemini.api-version=v1beta
app.gemini.model=gemini-1.5-flash
app.gemini.temperature=0.7
```

**Lưu ý:**
- Thay đổi `spring.datasource.password` theo password PostgreSQL của bạn
- Nếu Redis chạy trên host/port khác, cập nhật `spring.data.redis.host` và `spring.data.redis.port`

---

### **Bước 4: Build Project**

```bash
# Di chuyển vào thư mục backend
cd Heathy_App_Backend

# Clean và build project
mvn clean install

# Hoặc chỉ compile (nhanh hơn)
mvn compile
```

**Nếu gặp lỗi:**
- Kiểm tra Java version: `java -version` (phải là 21+)
- Kiểm tra Maven: `mvn -version`
- Xóa thư mục `target` và build lại: `mvn clean install`

---

### **Bước 5: Chạy Application**

#### **Option 1: Dùng Maven (Khuyến nghị cho development)**

```bash
mvn spring-boot:run
```

#### **Option 2: Dùng JAR file**

```bash
# Build JAR
mvn clean package

# Chạy JAR
java -jar target/Heathy_App_Backend-0.0.1-SNAPSHOT.jar
```

#### **Option 3: Chạy từ IDE**

1. Mở project trong IntelliJ IDEA / Eclipse
2. Tìm file `HeathyAppBackendApplication.java`
3. Click chuột phải → Run

---

### **Bước 6: Kiểm Tra Application**

#### **6.1. Kiểm Tra Logs**

Khi start thành công, bạn sẽ thấy:
```
Started HeathyAppBackendApplication in X.XXX seconds
```

**Kiểm tra kết nối Redis:**
- Nếu thấy lỗi Redis connection → Kiểm tra Redis đang chạy chưa
- Nếu không có lỗi → Redis đã kết nối thành công

#### **6.2. Test API**

```bash
# Test health check (nếu có endpoint)
curl http://localhost:8080/api/auth/signin

# Hoặc dùng Postman/Thunder Client để test
```

#### **6.3. Kiểm Tra Redis Cache**

```bash
# Kết nối Redis CLI
docker exec -it redis-healthy-app redis-cli

# Xem tất cả keys
KEYS *

# Xem value của một key
GET dashboard:14

# Thoát
exit
```

---

## 🔧 Troubleshooting

### **Lỗi: Cannot connect to Redis**

**Nguyên nhân:**
- Redis chưa được start
- Port 6379 bị chiếm
- Cấu hình host/port sai

**Giải pháp:**
```bash
# Kiểm tra Redis đang chạy
docker ps | grep redis
# hoặc
redis-cli ping

# Kiểm tra port 6379
netstat -an | grep 6379  # Windows
lsof -i :6379            # Mac/Linux

# Restart Redis nếu cần
docker restart redis-healthy-app
```

---

### **Lỗi: Database connection failed**

**Nguyên nhân:**
- PostgreSQL chưa start
- Database chưa được tạo
- Username/password sai

**Giải pháp:**
```bash
# Kiểm tra PostgreSQL đang chạy
# Windows: Services → PostgreSQL
# Linux: sudo systemctl status postgresql
# Mac: brew services list

# Tạo database nếu chưa có
psql -U postgres -c "CREATE DATABASE healthy_check;"

# Kiểm tra connection
psql -U postgres -d healthy_check
```

---

### **Lỗi: Port 8080 already in use**

**Nguyên nhân:**
- Có ứng dụng khác đang dùng port 8080

**Giải pháp:**
```bash
# Tìm process đang dùng port 8080
# Windows:
netstat -ano | findstr :8080

# Mac/Linux:
lsof -i :8080

# Kill process hoặc đổi port trong application.properties
server.port=8081
```

---

### **Lỗi: ClassCastException khi dùng cache**

**Nguyên nhân:**
- Cache cũ từ version trước không tương thích

**Giải pháp:**
```bash
# Xóa tất cả cache trong Redis
docker exec -it redis-healthy-app redis-cli FLUSHALL

# Hoặc xóa từng key cụ thể
docker exec -it redis-healthy-app redis-cli DEL dashboard:14
```

---

## 📝 Checklist Setup

- [ ] Đã clone/pull code mới nhất
- [ ] Đã cài đặt và chạy Redis (hoặc Docker)
- [ ] Đã tạo database PostgreSQL `healthy_check`
- [ ] Đã cấu hình `application.properties` (database, Redis)
- [ ] Đã build project thành công (`mvn clean install`)
- [ ] Đã start backend application
- [ ] Đã kiểm tra logs không có lỗi
- [ ] Đã test API hoạt động
- [ ] Đã kiểm tra Redis cache hoạt động

---

## 🎯 Quick Start (Tóm Tắt)

```bash
# 1. Pull code
git pull origin main

# 2. Start Redis (Docker)
docker run -d -p 6379:6379 --name redis-healthy-app redis:latest

# 3. Kiểm tra PostgreSQL đang chạy và database đã tạo

# 4. Cấu hình application.properties (nếu cần)

# 5. Build và run
cd Heathy_App_Backend
mvn clean install
mvn spring-boot:run
```

---

## 📚 Tài Liệu Tham Khảo

- **Redis Caching Guide**: Xem file `REDIS_CACHING_GUIDE.md`
- **API Documentation**: Xem các controller trong `src/main/java/.../controller/`
- **Database Schema**: Xem các entity trong `src/main/java/.../entity/`

---

## 💡 Tips

1. **Development**: Dùng `mvn spring-boot:run` để hot reload nhanh hơn
2. **Production**: Build JAR và chạy với `java -jar`
3. **Debug**: Bật logging level DEBUG trong `application.properties` để xem chi tiết
4. **Cache**: Nếu gặp vấn đề với cache, xóa cache cũ bằng `FLUSHALL`

---

## ❓ Cần Hỗ Trợ?

Nếu gặp vấn đề, kiểm tra:
1. Logs của application (console output)
2. Redis logs: `docker logs redis-healthy-app`
3. PostgreSQL logs
4. File `REDIS_CACHING_GUIDE.md` để biết thêm về caching


