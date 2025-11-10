# Healthy App Backend

Backend application cho Healthy App - Ứng dụng theo dõi sức khỏe với AI Support Chat.

## 🚀 Quick Start

### Yêu Cầu
- Java 21+
- Maven 3.6+
- PostgreSQL 14+
- Redis 6.0+ (hoặc Docker)

### Setup Nhanh

```bash
# 1. Clone repository
git clone <repository-url>
cd Heathy_App_Backend

# 2. Start Redis (Docker)
docker run -d -p 6379:6379 --name redis-healthy-app redis:latest

# 3. Cấu hình database trong application.properties

# 4. Build và run
mvn clean install
mvn spring-boot:run
```

## 📚 Tài Liệu

- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Hướng dẫn setup chi tiết cho teammate
- **[REDIS_CACHING_GUIDE.md](./REDIS_CACHING_GUIDE.md)** - Hướng dẫn sử dụng Redis caching

## 🌍 Triển Khai Và Môi Trường

### Cấu Hình Môi Trường

Ứng dụng hỗ trợ nhiều môi trường thông qua Spring Profiles:

- **Development** (`dev`): Môi trường phát triển với logging chi tiết
- **Production** (`prod`): Môi trường sản xuất với tối ưu hiệu suất

#### Cách Sử Dụng Profile

**1. Chạy với Maven:**
```bash
# Development
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Production
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

**2. Chạy với JAR:**
```bash
# Development
java -jar target/Heathy_App_Backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=dev

# Production
java -jar target/Heathy_App_Backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

**3. Sử dụng Environment Variable:**
```bash
export SPRING_PROFILES_ACTIVE=prod
mvn spring-boot:run
```

### Biến Môi Trường

Các biến môi trường có thể được cấu hình thay vì hardcode trong file properties:

| Biến | Mô tả | Mặc định |
|------|-------|----------|
| `SPRING_PROFILES_ACTIVE` | Profile môi trường (dev/prod) | `dev` |
| `SERVER_PORT` | Port của ứng dụng | `8080` |
| `DATABASE_URL` | URL kết nối PostgreSQL | `jdbc:postgresql://localhost:5432/healthy_check...` |
| `DATABASE_USERNAME` | Username database | `postgres` |
| `DATABASE_PASSWORD` | Password database | `root` |
| `JPA_DDL_AUTO` | Hibernate DDL mode | `update` (dev), `validate` (prod) |
| `JWT_SECRET` | Secret key cho JWT | (cần cấu hình) |
| `JWT_EXPIRATION_MS` | Thời gian hết hạn JWT (ms) | `86400000` |
| `GEMINI_API_KEY` | API key cho Google Gemini | (cần cấu hình) |
| `GEMINI_MODEL` | Model Gemini sử dụng | `gemini-2.0-flash` |
| `REDIS_HOST` | Host Redis | `localhost` |
| `REDIS_PORT` | Port Redis | `6379` |
| `REDIS_PASSWORD` | Password Redis | (tùy chọn) |
| `CORS_ALLOWED_ORIGINS` | Các origin được phép CORS | (tùy chọn) |

### Triển Khai Với Docker

#### 1. Sử dụng Docker Compose (Khuyến nghị)

**Bước 1:** Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
# Chỉnh sửa .env với các giá trị thực tế
```

**Bước 2:** Chạy toàn bộ stack:
```bash
docker-compose up -d
```

**Bước 3:** Kiểm tra logs:
```bash
docker-compose logs -f app
```

**Bước 4:** Dừng services:
```bash
docker-compose down
```

**Bước 5:** Dừng và xóa volumes (xóa dữ liệu):
```bash
docker-compose down -v
```

#### 2. Build và chạy Docker Image riêng

**Build image:**
```bash
docker build -t healthy-app-backend:latest .
```

**Chạy container:**
```bash
docker run -d \
  --name healthy-app-backend \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e DATABASE_URL=jdbc:postgresql://host.docker.internal:5432/healthy_check \
  -e DATABASE_USERNAME=postgres \
  -e DATABASE_PASSWORD=your_password \
  -e JWT_SECRET=your_jwt_secret \
  -e GEMINI_API_KEY=your_api_key \
  -e REDIS_HOST=host.docker.internal \
  healthy-app-backend:latest
```

### Triển Khai Production

#### Yêu Cầu Hệ Thống

- **Java**: 21+
- **Memory**: Tối thiểu 512MB, khuyến nghị 1GB+
- **CPU**: 1 core tối thiểu, 2+ cores khuyến nghị
- **Disk**: 1GB+ cho ứng dụng và logs

#### Các Bước Triển Khai

**1. Build ứng dụng:**
```bash
mvn clean package -DskipTests
```

**2. Tạo thư mục triển khai:**
```bash
mkdir -p /opt/healthy-app
mkdir -p /var/log/healthy-app
```

**3. Copy JAR file:**
```bash
cp target/Heathy_App_Backend-0.0.1-SNAPSHOT.jar /opt/healthy-app/
```

**4. Tạo file systemd service** (`/etc/systemd/system/healthy-app.service`):
```ini
[Unit]
Description=Healthy App Backend
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=healthy-app
WorkingDirectory=/opt/healthy-app
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod /opt/healthy-app/Heathy_App_Backend-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=healthy-app

[Install]
WantedBy=multi-user.target
```

**5. Khởi động service:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable healthy-app
sudo systemctl start healthy-app
sudo systemctl status healthy-app
```

#### Cấu Hình Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Bảo Mật Production

1. **Thay đổi mật khẩu mặc định:**
   - Database password
   - Redis password (nếu có)
   - JWT secret (phải là chuỗi ngẫu nhiên dài, tối thiểu 64 ký tự)

2. **Cấu hình Firewall:**
   ```bash
   # Chỉ mở port cần thiết
   sudo ufw allow 22/tcp    # SSH
   sudo ufw allow 80/tcp    # HTTP
   sudo ufw allow 443/tcp   # HTTPS
   sudo ufw enable
   ```

3. **Sử dụng HTTPS:**
   - Cài đặt SSL certificate (Let's Encrypt)
   - Cấu hình Nginx với SSL

4. **Backup Database:**
   ```bash
   # Tạo backup script
   pg_dump -U postgres healthy_check > backup_$(date +%Y%m%d).sql
   ```

### Monitoring và Health Check

Ứng dụng hỗ trợ health check endpoint (cần thêm Spring Boot Actuator):

```bash
# Kiểm tra health
curl http://localhost:8080/actuator/health
```

### Troubleshooting Deployment

**1. Ứng dụng không khởi động:**
- Kiểm tra logs: `journalctl -u healthy-app -f`
- Kiểm tra database connection
- Kiểm tra Redis connection
- Kiểm tra port đã được sử dụng chưa

**2. Lỗi kết nối database:**
- Kiểm tra PostgreSQL đang chạy: `sudo systemctl status postgresql`
- Kiểm tra credentials trong environment variables
- Kiểm tra firewall rules

**3. Lỗi kết nối Redis:**
- Kiểm tra Redis đang chạy: `redis-cli ping`
- Kiểm tra password nếu có
- Kiểm tra network connectivity

**4. Out of Memory:**
- Tăng heap size: `-Xmx1g -Xms512m`
- Kiểm tra memory usage: `free -h`

## 🛠️ Công Nghệ Sử Dụng

- **Framework**: Spring Boot 3.5.6
- **Database**: PostgreSQL
- **Cache**: Redis
- **Security**: Spring Security + JWT
- **AI**: Google Gemini API
- **WebSocket**: Spring WebSocket

## 📁 Cấu Trúc Project

```
Heathy_App_Backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/iuh/heathy_app_backend/
│   │   │       ├── config/          # Configuration classes
│   │   │       ├── controller/      # REST Controllers
│   │   │       ├── dto/             # Data Transfer Objects
│   │   │       ├── entity/           # JPA Entities
│   │   │       ├── repository/       # JPA Repositories
│   │   │       └── service/          # Business Logic
│   │   └── resources/
│   │       ├── application.properties
│   │       └── docs/                 # Documentation files
│   └── test/
├── pom.xml
├── SETUP_GUIDE.md
├── REDIS_CACHING_GUIDE.md
└── README.md
```

## 🔑 Cấu Hình Quan Trọng

### Database
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/healthy_check
spring.datasource.username=postgres
spring.datasource.password=your_password
```

### Redis
```properties
spring.data.redis.host=localhost
spring.data.redis.port=6379
```

### Gemini AI
```properties
app.gemini.api-key=your_api_key
app.gemini.api-version=v1beta
app.gemini.model=gemini-1.5-flash
```

## 🎯 API Endpoints

- **Auth**: `/api/auth/signin`, `/api/auth/signup`
- **Users**: `/api/users/{id}/profile`, `/api/users/{id}/dashboard`
- **Health Data**: `/api/users/{id}/health-data`
- **Meal Logs**: `/api/users/{id}/meal-logs`
- **Articles**: `/api/articles`
- **Categories**: `/api/categories`
- **Support Chat**: `/api/support/chat`

## 💾 Caching

Backend sử dụng Redis để cache:
- Dashboard data (TTL: 10 phút)
- Categories (TTL: 24 giờ)
- Articles (TTL: 30 phút)
- User Profile & Goals (TTL: 30 phút)
- Meal Logs (TTL: 10 phút)

Xem chi tiết trong [REDIS_CACHING_GUIDE.md](./REDIS_CACHING_GUIDE.md)

## 🐛 Troubleshooting

Xem [SETUP_GUIDE.md](./SETUP_GUIDE.md) phần Troubleshooting để biết cách xử lý các lỗi thường gặp.

## 📝 License

[Your License Here]


