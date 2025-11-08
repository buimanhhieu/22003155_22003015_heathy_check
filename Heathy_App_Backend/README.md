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

