# 🏥 Healthy Check App

Ứng dụng di động theo dõi sức khỏe toàn diện với AI Support Chat, giúp người dùng quản lý dinh dưỡng, hoạt động thể chất, giấc ngủ và nhận tư vấn sức khỏe từ AI.

## 📱 Tính Năng Chính

- ✅ **Theo dõi Dinh dưỡng**: Ghi nhận bữa ăn, tính toán calories
- ✅ **Theo dõi Sức khỏe**: Steps, Sleep, Cycle Tracking
- ✅ **Dashboard**: Tổng quan sức khỏe hàng ngày
- ✅ **Articles**: Đọc bài viết về sức khỏe
- ✅ **AI Support Chat**: Tư vấn sức khỏe với Google Gemini AI
- ✅ **User Profile**: Quản lý thông tin cá nhân và mục tiêu
- ✅ **Redis Caching**: Tối ưu hiệu suất với caching

---

## 📁 Cấu Trúc Project

```
Mobile/
├── Heathy_App_Backend/          # Backend API (Spring Boot)
│   ├── src/
│   │   └── main/
│   │       ├── java/            # Source code
│   │       └── resources/       # Config files
│   ├── pom.xml
│   ├── README.md                # Backend documentation
│   ├── SETUP_GUIDE.md          # Setup guide cho teammate
│   └── REDIS_CACHING_GUIDE.md  # Redis caching guide
│
├── Heathy_Check_app/            # Frontend Mobile App (React Native/Expo)
│   ├── src/
│   │   ├── api/                 # API clients
│   │   ├── screens/             # App screens
│   │   ├── navigation/          # Navigation config
│   │   ├── components/          # Reusable components
│   │   └── services/            # Services (Steps, Notifications)
│   ├── package.json
│   └── README_SETUP.md         # Frontend setup guide
│
└── README.md                    # File này
```

---

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Framework**: Spring Boot 3.5.6
- **Language**: Java 21
- **Database**: PostgreSQL 14+
- **Cache**: Redis 6.0+
- **Security**: Spring Security + JWT
- **AI**: Google Gemini API
- **Build Tool**: Maven

### Frontend
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: React Context
- **HTTP Client**: Axios
- **UI Components**: React Native Paper, Vector Icons

---

## 🚀 Quick Start

### Yêu Cầu Hệ Thống

#### Backend
- Java 21+
- Maven 3.6+
- PostgreSQL 14+
- Redis 6.0+ (hoặc Docker)

#### Frontend
- Node.js 18+
- npm hoặc yarn
- Expo CLI
- Android Studio (cho Android) hoặc Xcode (cho iOS)

---

### Setup Backend

```bash
# 1. Di chuyển vào thư mục backend
cd Heathy_App_Backend

# 2. Start Redis (Docker)
docker run -d -p 6379:6379 --name redis-healthy-app redis:latest

# 3. Tạo database PostgreSQL
psql -U postgres -c "CREATE DATABASE healthy_check;"

# 4. Cấu hình application.properties
# Sửa: spring.datasource.password=your_password

# 5. Build và run
mvn clean install
mvn spring-boot:run
```

**Backend sẽ chạy tại:** `http://localhost:8080`

📚 **Chi tiết:** Xem [Heathy_App_Backend/SETUP_GUIDE.md](./Heathy_App_Backend/SETUP_GUIDE.md)

---

### Setup Frontend

```bash
# 1. Di chuyển vào thư mục frontend
cd Heathy_Check_app

# 2. Cài đặt dependencies
npm install

# 3. Cấu hình API URL
# Tạo file .env từ .env.example (nếu có)
# Hoặc sửa src/config/api.ts

# 4. Start Expo
npm start
# hoặc
npx expo start
```

**Frontend sẽ chạy trên:** Expo Dev Client

📚 **Chi tiết:** Xem [Heathy_Check_app/README_SETUP.md](./Heathy_Check_app/README_SETUP.md)

---

## 📚 Tài Liệu

### Backend
- **[SETUP_GUIDE.md](./Heathy_App_Backend/SETUP_GUIDE.md)** - Hướng dẫn setup chi tiết cho teammate
- **[REDIS_CACHING_GUIDE.md](./Heathy_App_Backend/REDIS_CACHING_GUIDE.md)** - Hướng dẫn Redis caching
- **[README.md](./Heathy_App_Backend/README.md)** - Backend documentation

### Frontend
- **[README_SETUP.md](./Heathy_Check_app/README_SETUP.md)** - Frontend setup guide
- **[STEPS_TESTING_GUIDE.md](./Heathy_Check_app/STEPS_TESTING_GUIDE.md)** - Hướng dẫn test Steps feature

---

## 🔑 Cấu Hình Quan Trọng

### Backend (`Heathy_App_Backend/src/main/resources/application.properties`)

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/healthy_check
spring.datasource.username=postgres
spring.datasource.password=your_password

# Redis
spring.data.redis.host=localhost
spring.data.redis.port=6379

# Gemini AI
app.gemini.api-key=your_api_key
app.gemini.api-version=v1beta
app.gemini.model=gemini-1.5-flash
```

### Frontend (`Heathy_Check_app/src/config/api.ts` hoặc `.env`)

```typescript
// Cấu hình API base URL
const API_BASE_URL = 'http://YOUR_IP:8080/api';
// Thay YOUR_IP bằng IP máy chạy backend
```

**Lưu ý:** 
- Trên Android emulator: dùng `10.0.2.2` thay vì `localhost`
- Trên iOS simulator: dùng `localhost` hoặc IP thực
- Trên thiết bị thật: dùng IP thực của máy chạy backend

---

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/signin` - Đăng nhập
- `POST /api/auth/signup` - Đăng ký

### Users
- `GET /api/users/{id}/profile` - Lấy thông tin profile
- `PUT /api/users/{id}/profile` - Cập nhật profile
- `GET /api/users/{id}/dashboard` - Lấy dashboard data
- `GET /api/users/{id}/goal` - Lấy mục tiêu
- `PUT /api/users/{id}/goal` - Cập nhật mục tiêu

### Health Data
- `GET /api/users/{id}/health-data` - Lấy health data
- `POST /api/users/{id}/health-data` - Tạo health data
- `PUT /api/users/{id}/health-data/{healthDataId}` - Cập nhật
- `DELETE /api/users/{id}/health-data/{healthDataId}` - Xóa

### Meal Logs
- `GET /api/users/{id}/meal-logs` - Lấy meal logs
- `POST /api/users/{id}/meal-logs` - Tạo meal log
- `PUT /api/users/{id}/meal-logs/{mealLogId}` - Cập nhật
- `DELETE /api/users/{id}/meal-logs/{mealLogId}` - Xóa

### Articles
- `GET /api/articles` - Lấy danh sách articles
- `GET /api/articles/{id}` - Lấy chi tiết article
- `POST /api/articles/{id}/vote` - Vote article
- `DELETE /api/articles/{id}/vote` - Unvote article

### Categories
- `GET /api/categories` - Lấy danh sách categories
- `GET /api/categories/{id}` - Lấy chi tiết category

### Support Chat
- `POST /api/support/chat` - Chat với AI

---

## 💾 Redis Caching

Backend sử dụng Redis để cache các dữ liệu thường xuyên truy cập:

| Dữ liệu | TTL | Mô tả |
|---------|-----|-------|
| Dashboard | 10 phút | Dữ liệu dashboard của user |
| Categories | 24 giờ | Danh sách categories |
| Articles | 30 phút | Danh sách và chi tiết articles |
| User Profile | 30 phút | Thông tin profile và goals |
| Meal Logs | 10 phút | Meal logs của user |

Cache tự động được invalidate khi có thay đổi dữ liệu.

📚 **Chi tiết:** Xem [REDIS_CACHING_GUIDE.md](./Heathy_App_Backend/REDIS_CACHING_GUIDE.md)

---

## 🧪 Testing

### Backend
```bash
cd Heathy_App_Backend
mvn test
```

### Frontend
```bash
cd Heathy_Check_app
npm test
```

---

## 🐛 Troubleshooting

### Backend không kết nối được Redis
```bash
# Kiểm tra Redis đang chạy
docker ps | grep redis
# hoặc
redis-cli ping

# Restart Redis
docker restart redis-healthy-app
```

### Frontend không kết nối được Backend
- Kiểm tra IP address trong `src/config/api.ts`
- Đảm bảo backend đang chạy tại port 8080
- Kiểm tra firewall không chặn port 8080
- Trên Android emulator, dùng `10.0.2.2` thay vì `localhost`

### Lỗi ClassCastException khi dùng cache
```bash
# Xóa cache cũ
docker exec -it redis-healthy-app redis-cli FLUSHALL
```

📚 **Chi tiết troubleshooting:** Xem [SETUP_GUIDE.md](./Heathy_App_Backend/SETUP_GUIDE.md)

---

## 👥 Cho Teammate Mới

### Checklist Setup

1. **Backend:**
   - [ ] Clone/pull code
   - [ ] Cài đặt Java 21, Maven, PostgreSQL
   - [ ] Start Redis (Docker)
   - [ ] Tạo database `healthy_check`
   - [ ] Cấu hình `application.properties`
   - [ ] Build và run backend

2. **Frontend:**
   - [ ] Clone/pull code
   - [ ] Cài đặt Node.js, npm
   - [ ] Cài đặt dependencies (`npm install`)
   - [ ] Cấu hình API URL
   - [ ] Start Expo

3. **Kiểm tra:**
   - [ ] Backend chạy tại `http://localhost:8080`
   - [ ] Redis đang chạy
   - [ ] Frontend kết nối được backend
   - [ ] Test đăng nhập/đăng ký

📚 **Hướng dẫn chi tiết:** Xem [SETUP_GUIDE.md](./Heathy_App_Backend/SETUP_GUIDE.md)

---

## 📝 Scripts Hữu Ích

### Backend
```bash
# Clean và build
mvn clean install

# Run application
mvn spring-boot:run

# Test
mvn test
```

### Frontend
```bash
# Install dependencies
npm install

# Start Expo
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Sync environment variables
npm run sync-env
```

---

## 🔒 Security

- JWT Authentication cho tất cả API endpoints (trừ signin/signup)
- Password được hash bằng BCrypt
- CORS được cấu hình cho frontend
- API keys được lưu trong `application.properties` (không commit)

---

## 📦 Deployment

### Backend
```bash
# Build JAR
cd Heathy_App_Backend
mvn clean package

# Run JAR
java -jar target/Heathy_App_Backend-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
# Build APK/IPA
cd Heathy_Check_app
eas build --platform android
eas build --platform ios
```

---

## 🤝 Contributing

1. Tạo branch mới từ `main`
2. Commit changes với message rõ ràng
3. Push và tạo Pull Request
4. Đợi review và merge

---

## 📄 License

[Your License Here]

---

## 👨‍💻 Authors

- [Bùi Mạnh hiếu /Lê Phan Quốc Đại]

---

## 🙏 Acknowledgments

- Google Gemini AI
- Spring Boot Community
- React Native Community
- Expo Team

---

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra [Troubleshooting](#-troubleshooting)
2. Xem các file hướng dẫn trong từng thư mục
3. Tạo issue trên repository

---

**Happy Coding! 🚀**
