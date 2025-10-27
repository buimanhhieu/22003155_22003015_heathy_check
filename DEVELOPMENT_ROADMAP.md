# 🗺️ HEALTHY CHECK APP - DEVELOPMENT ROADMAP

## 📊 TỔNG QUAN DỰ ÁN

### ✅ ĐÃ HOÀN THÀNH
- [x] Authentication (Login/Signup)
- [x] User Profile Management
- [x] User Goals Configuration
- [x] Dashboard với Health Score
- [x] Highlights (Steps, Sleep, Cycle Tracking)
- [x] Weekly Report (basic)
- [x] Articles List
- [x] Cycle Tracking cho Female Users

### 🚧 ĐANG THIẾU
- [ ] **Health Data Input** - User chưa thể nhập dữ liệu
- [ ] **Charts/History** - Chưa có biểu đồ
- [ ] **Nutrition Tracking** - Chưa có meal logging
- [ ] **Article Detail** - Chưa có chi tiết bài viết
- [ ] **Symptoms Tracking** - Chưa có UI
- [ ] **Settings** - Chưa có cấu hình
- [ ] **Backend APIs thiếu** - Health data save, nutrition, symptoms

---

## 🎯 GIAI ĐOẠN 1: CƠ BẢN - INPUT DỮ LIỆU (Week 1-2)

### **Task 1.1: Tạo Health Data Input Screen**
**File:** `src/screens/HealthInputScreen.tsx`

**Chức năng:**
- User nhập Steps, Sleep, Heart Rate, Weight, Water Intake
- Form validation
- Save button
- Success/Error notifications

**API cần:**
```java
@PostMapping("/{id}/health-data")
public ResponseEntity<HealthDataEntry> saveHealthData(
    @PathVariable Long id,
    @RequestBody HealthDataRequest request)
```

### **Task 1.2: Tạo Backend API cho Health Data**
**Files:**
- `src/main/java/.../dto/HealthDataRequest.java`
- `src/main/java/.../controller/HealthDataController.java`

**Chức năng:**
- POST /api/health-data - Lưu health metrics
- GET /api/health-data/{userId}/today - Dữ liệu hôm nay
- GET /api/health-data/{userId}/week - 7 ngày qua

### **Task 1.3: Tích hợp Input vào Navigation**
**File:** `src/navigation/AppNavigator.tsx`

**Chức năng:**
- Thêm tab "Input" vào bottom navigation
- Hoặc button "Add Data" trên Dashboard

---

## 🎯 GIAI ĐOẠN 2: VISUALIZATION - CHART & HISTORY (Week 3-4)

### **Task 2.1: Cài đặt Chart Library**
```bash
npm install react-native-chart-kit
```

### **Task 2.2: Tạo Charts Screen**
**File:** `src/screens/ChartsScreen.tsx`

**Biểu đồ cần:**
- Line Chart: Steps (7 ngày, 30 ngày)
- Line Chart: Sleep Duration
- Line Chart: Heart Rate
- Bar Chart: Water Intake
- Bar Chart: Calories Burned

### **Task 2.3: Backend API cho Charts**
**File:** `src/main/java/.../service/ChartService.java`

**Endpoints:**
- GET /api/charts/{userId}/steps/week
- GET /api/charts/{userId}/sleep/week
- GET /api/charts/{userId}/water/week

---

## 🎯 GIAI ĐOẠN 3: NUTRITION - THEO DÕI DINH DƯỠNG (Week 5-6)

### **Task 3.1: Tạo Nutrition Tracking Screen**
**File:** `src/screens/NutritionScreen.tsx`

**Chức năng:**
- Input meal (breakfast, lunch, dinner, snack)
- Calories input
- Macronutrients (protein, carbs, fat)
- Daily summary
- Weekly average

### **Task 3.2: Backend API cho Nutrition**
**Files:**
- `src/main/java/.../dto/MealRequest.java`
- `src/main/java/.../controller/NutritionController.java`

**Endpoints:**
- POST /api/nutrition/{userId}/meals
- GET /api/nutrition/{userId}/today
- GET /api/nutrition/{userId}/week
- GET /api/nutrition/{userId}/summary

### **Task 3.3: Database Schema**
```sql
CREATE TABLE meal_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    meal_type VARCHAR(20), -- breakfast, lunch, dinner, snack
    food_name VARCHAR(255),
    calories DECIMAL(10,2),
    protein_grams DECIMAL(10,2),
    carbs_grams DECIMAL(10,2),
    fat_grams DECIMAL(10,2),
    logged_at TIMESTAMP
);
```

---

## 🎯 GIAI ĐOẠN 4: CONTENT - ARTICLES & DETAILS (Week 7-8)

### **Task 4.1: Tạo Article Detail Screen**
**File:** `src/screens/ArticleDetailScreen.tsx`

**Chức năng:**
- Hiển thị nội dung bài viết
- Vote up/down
- Share button
- Related articles
- Reading time estimate

### **Task 4.2: Backend API cho Articles**
**Files:**
- `src/main/java/.../controller/ArticleController.java`

**Endpoints:**
- GET /api/articles/{id}
- POST /api/articles/{id}/vote
- GET /api/articles/{id}/related
- GET /api/articles/{id}/comments (future)

### **Task 4.3: Voting Functionality**
**UI:**
- Upvote button (green)
- Downvote button (red)
- Vote count display
- User's vote indicator

---

## 🎯 GIAI ĐOẠN 5: ADVANCED - SYMPTOMS & SETTINGS (Week 9-10)

### **Task 5.1: Tạo Symptoms Tracking Screen**
**File:** `src/screens/SymptomsTrackingScreen.tsx`

**Chức năng:**
- Input symptoms (fever, headache, fatigue, etc.)
- Track frequency
- Pattern detection
- Health alerts

### **Task 5.2: Tạo Settings Screen**
**File:** `src/screens/SettingsScreen.tsx`

**Cấu hình:**
- Notifications on/off
- Unit preferences (kg/lbs, cm/inches)
- Privacy settings
- Data sharing permissions
- App version info

### **Task 5.3: Backend API cho Settings**
**Files:**
- `src/main/java/.../dto/SettingsUpdateDTO.java`
- `src/main/java/.../controller/SettingsController.java`

**Endpoints:**
- GET /api/settings/{userId}
- PUT /api/settings/{userId}
- PUT /api/settings/{userId}/notifications
- PUT /api/settings/{userId}/privacy

---

## 🎯 GIAI ĐOẠN 6: OPTIMIZATION - PERFORMANCE & UX (Week 11-12)

### **Task 6.1: Caching & Offline Support**
- AsyncStorage cho offline data
- Cache dashboard data
- Optimistic updates
- Sync when online

### **Task 6.2: Push Notifications**
- Reminder for water intake
- Reminder for meal logging
- Daily summary notification
- Goal achievement alerts

### **Task 6.3: Achievement System**
**Database:**
```sql
CREATE TABLE achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    achievement_type VARCHAR(50),
    achieved_at TIMESTAMP
);
```

**Achievements:**
- First 10K steps
- 7-day streak
- Completed nutrition goal
- Perfect week

---

## 📋 IMPLEMENTATION CHECKLIST

### **Frontend (React Native)**
- [ ] HealthInputScreen.tsx
- [ ] ChartsScreen.tsx
- [ ] NutritionScreen.tsx
- [ ] ArticleDetailScreen.tsx
- [ ] SymptomsTrackingScreen.tsx
- [ ] SettingsScreen.tsx
- [ ] Navigation integration
- [ ] API integration
- [ ] State management
- [ ] Error handling

### **Backend (Spring Boot)**
- [ ] HealthDataController.java
- [ ] NutritionController.java
- [ ] ArticleController.java
- [ ] SettingsController.java
- [ ] DTOs (HealthDataRequest, MealRequest, etc.)
- [ ] Services (HealthDataService, NutritionService, etc.)
- [ ] Repositories (if needed)
- [ ] Database migrations
- [ ] API documentation

### **Database (PostgreSQL)**
- [ ] Health_data_entries table (đã có)
- [ ] Meal_logs table (đã có)
- [ ] Settings table (cần thêm)
- [ ] Achievements table (cần thêm)
- [ ] Indexes optimization
- [ ] Sample data scripts

---

## 🚀 QUICK START - IMPLEMENTATION ORDER

### **1. START HERE: Health Data Input (Week 1)**
```bash
# Backend
- Tạo HealthDataController.java
- Tạo HealthDataRequest DTO
- Implement saveHealthData() method
- Test API với Postman

# Frontend  
- Tạo HealthInputScreen.tsx
- Tạo form với TextInput
- Integrate với API
- Test save data
```

### **2. THEN: Charts (Week 2)**
```bash
# Install chart library
npm install react-native-chart-kit

# Create ChartsScreen
- Line charts cho 7 days data
- Integrate với backend API
- Test visualization
```

### **3. THEN: Nutrition (Week 3-4)**
```bash
# Backend - Nutrition API
# Frontend - NutritionScreen
# Database - Meal logs
# Integration testing
```

---

## 📊 SUCCESS METRICS

### **Completion Criteria**
- [ ] User có thể nhập health data hàng ngày
- [ ] Charts hiển thị đúng dữ liệu 7/30 ngày
- [ ] Nutrition tracking hoạt động đầy đủ
- [ ] Article detail có vote functionality
- [ ] Settings screen hoàn chỉnh
- [ ] Tất cả APIs được test và working
- [ ] UI/UX smooth và professional
- [ ] Error handling đầy đủ
- [ ] Performance tốt (<3s load time)
- [ ] No crashes in testing

---

## 💡 FUTURE ENHANCEMENTS (Phase 2)

### **AI Features**
- Health score prediction
- Personalized recommendations
- Anomaly detection
- Trend analysis

### **Social Features**
- Friend connections
- Leaderboards
- Challenges
- Group activities

### **Premium Features**
- Advanced analytics
- Professional reports
- Nutritionist access
- Custom goals

---

## 📝 NOTES

- Prioritize data input first - không có data thì không có gì để show
- Start simple, iterate
- Test thoroughly before moving to next feature
- Document all APIs
- Keep UI consistent with existing design
- Follow existing code patterns

---

**Last Updated:** $(date)
**Status:** Planning Phase
**Next Milestone:** Week 1-2 Implementation


