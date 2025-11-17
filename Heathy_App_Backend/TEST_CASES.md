# Bảng Test Cases - Healthy App Backend

## 1. Authentication Service Tests

| Test ID | Test Name | Description | Preconditions | Test Steps | Expected Results | Status |
|---------|-----------|-------------|---------------|------------|------------------|--------|
| AUTH-001 | testRegisterUser_Success | Đăng ký tài khoản thành công | Email chưa tồn tại trong hệ thống | 1. Gọi `registerUser()` với email mới<br>2. Service kiểm tra email chưa tồn tại<br>3. Mã hóa password<br>4. Lưu user vào database | - Response chứa message "User registered successfully!"<br>- User được lưu vào database<br>- Password được mã hóa | ✅ |
| AUTH-002 | testRegisterUser_EmailAlreadyExists | Đăng ký với email đã tồn tại | Email đã tồn tại trong hệ thống | 1. Gọi `registerUser()` với email đã tồn tại<br>2. Service kiểm tra email đã tồn tại | - Response chứa message "Error: Email is already in use!"<br>- User không được lưu vào database | ✅ |
| AUTH-003 | Password Too Short | Mật khẩu quá ngắn | - | Validation được xử lý ở Controller level | - | ⚠️ Controller Test |
| AUTH-004 | Missing Required Field | Thiếu trường bắt buộc | - | Validation được xử lý ở Controller level | - | ⚠️ Controller Test |
| AUTH-005 | testAuthenticateUser_Success | Đăng nhập thành công | User đã đăng ký với email và password hợp lệ | 1. Gọi `authenticateUser()` với email và password đúng<br>2. AuthenticationManager xác thực thành công<br>3. Tạo JWT token | - Response chứa JWT token<br>- Response chứa thông tin user (id, email, name)<br>- SecurityContext được set | ✅ |
| AUTH-006 | testAuthenticateUser_WrongPassword | Đăng nhập với mật khẩu sai | User đã đăng ký | 1. Gọi `authenticateUser()` với password sai<br>2. AuthenticationManager throw BadCredentialsException | - Throw BadCredentialsException với message "Bad credentials"<br>- JWT token không được tạo | ✅ |
| AUTH-007 | testAuthenticateUser_EmailNotFound | Đăng nhập với email không tồn tại | Email chưa đăng ký | 1. Gọi `authenticateUser()` với email không tồn tại<br>2. AuthenticationManager throw BadCredentialsException | - Throw BadCredentialsException với message "User not found"<br>- JWT token không được tạo | ✅ |
| AUTH-008 | testChangePassword_Success | Đổi mật khẩu thành công | User đã đăng nhập, mật khẩu hiện tại đúng | 1. Gọi `changePassword()` với currentPassword đúng<br>2. Service kiểm tra password hiện tại<br>3. Mã hóa password mới<br>4. Lưu user với password mới | - Password được cập nhật thành công<br>- Password mới được mã hóa | ✅ |
| AUTH-009 | testChangePassword_WrongCurrentPassword | Đổi mật khẩu với mật khẩu hiện tại sai | User đã đăng nhập | 1. Gọi `changePassword()` với currentPassword sai<br>2. Service kiểm tra password hiện tại | - Throw RuntimeException với message "Current password is incorrect"<br>- Password không được cập nhật | ✅ |

## 2. User Service Tests

| Test ID | Test Name | Description | Preconditions | Test Steps | Expected Results | Status |
|---------|-----------|-------------|---------------|------------|------------------|--------|
| PROFILE-001 | testGetUserProfileResponse_Success | Xem thông tin profile | User đã đăng nhập, có profile trong database | 1. Gọi `getUserProfileResponse()` với userId<br>2. Service lấy profile từ database (cache miss)<br>3. Lưu vào cache | - Response chứa đầy đủ thông tin profile<br>- Profile được lưu vào cache (30 phút)<br>- Response khớp với dữ liệu trong database | ✅ |
| PROFILE-001 | testGetUserProfileResponse_FromCache | Xem profile từ cache | Profile đã được cache | 1. Gọi `getUserProfileResponse()` với userId<br>2. Service lấy từ cache | - Response trả về từ cache<br>- Không query database | ✅ |
| PROFILE-002 | testUpdateUserProfile_Success | Cập nhật thông tin profile | User đã đăng nhập, có profile | 1. Gọi `updateUserProfile()` với dữ liệu mới<br>2. Service cập nhật profile<br>3. Xóa cache | - Profile được cập nhật thành công<br>- Cache được xóa<br>- Dashboard cache được invalidate | ✅ |
| PROFILE-003 | testUpdateUserProfile_InvalidHeight | Cập nhật với chiều cao không hợp lệ | User đã đăng nhập | 1. Gọi `updateUserProfile()` với height < 100cm<br>2. Service chấp nhận dữ liệu (validation ở controller) | - Service chấp nhận dữ liệu<br>- Validation được xử lý ở Controller level | ✅ |
| GOAL-001 | testUpdateUserGoal_SetHealthGoal | Thiết lập mục tiêu sức khỏe | User đã đăng nhập, có profile, chưa có goal | 1. Gọi `updateUserGoal()` với dailyStepsGoal, bedtime, wakeup, activityLevel<br>2. Service tính dailyCaloriesGoal từ BMR<br>3. Lưu goal mới | - Goal được tạo thành công<br>- dailyCaloriesGoal được tính từ BMR và activityLevel<br>- Cache được xóa | ✅ |
| GOAL-002 | testUpdateUserGoal_UpdateStepGoal | Cập nhật mục tiêu bước chân | User đã có goal | 1. Gọi `updateUserGoal()` với dailyStepsGoal mới<br>2. Service cập nhật goal | - dailyStepsGoal được cập nhật<br>- Cache được xóa | ✅ |
| GOAL-003 | Invalid Step Goal | Mục tiêu bước chân không hợp lệ | - | Validation được xử lý ở Controller level | - | ⚠️ Controller Test |
| GOAL-004 | testUpdateUserGoal_CalculateCaloriesFromBMR | Tính calo từ BMR | User có profile với thông tin đầy đủ | 1. Gọi `updateUserGoal()` với activityLevel mới<br>2. Service tính BMR từ profile<br>3. Tính dailyCaloriesGoal = BMR * multiplier | - dailyCaloriesGoal được tính chính xác<br>- BMR được tính từ weight, height, age, gender<br>- Multiplier phù hợp với activityLevel | ✅ |
| GOAL-005 | - | - | - | - | - | - |

## 3. Health Data Service Tests

| Test ID | Test Name | Description | Preconditions | Test Steps | Expected Results | Status |
|---------|-----------|-------------|---------------|------------|------------------|--------|
| HEALTH-001 | testCreateHealthData_SaveSteps | Lưu số bước chân | User đã đăng nhập | 1. Gọi `createHealthData()` với metricType=STEPS, value=5000<br>2. Service lưu vào database | - HealthDataEntry được tạo thành công<br>2. MetricType, value, unit được lưu đúng<br>3. recordedAt được set<br>4. Dashboard cache được invalidate | ✅ |
| HEALTH-002 | testGetHealthData_GetTodaySteps | Lấy số bước chân hôm nay | User đã có dữ liệu steps hôm nay | 1. Gọi `getHealthData()` với date=today, metricType=STEPS<br>2. Service lọc dữ liệu theo ngày | - Trả về danh sách entries của ngày hôm nay<br>- Chỉ lấy entries có metricType=STEPS | ✅ |
| HEALTH-003 | testGetHealthData_GetWeeklyData | Lấy dữ liệu 7 ngày | User đã có dữ liệu trong 7 ngày qua | 1. Gọi `getHealthData()` với date=7 ngày trước, metricType=STEPS<br>2. Service lọc dữ liệu trong khoảng 7 ngày | - Trả về danh sách entries trong 7 ngày<br>- Dữ liệu được lọc đúng theo date range | ✅ |
| HEALTH-004 | testCreateHealthData_AddMeal | Lưu dữ liệu giấc ngủ | User đã đăng nhập | 1. Gọi `createHealthData()` với metricType=SLEEP_DURATION, value=8<br>2. Service lưu vào database | - HealthDataEntry được tạo thành công<br>- MetricType, value, unit được lưu đúng | ✅ |
| HEALTH-004 | testCreateHealthData_UserNotFound | Lưu dữ liệu với user không tồn tại | UserId không tồn tại | 1. Gọi `createHealthData()` với userId không tồn tại | - Throw RuntimeException với message "User not found with id: {userId}"<br>- Không lưu vào database | ✅ |

## 4. Meal Log Service Tests

| Test ID | Test Name | Description | Preconditions | Test Steps | Expected Results | Status |
|---------|-----------|-------------|---------------|------------|------------------|--------|
| HEALTH-004 | testCreateMealLog_Success | Thêm bữa ăn thành công | User đã đăng nhập | 1. Gọi `createMealLog()` với mealType, totalCalories, macros<br>2. Service lưu vào database | - MealLog được tạo thành công<br>- Tất cả thông tin được lưu đúng<br>- Cache được xóa<br>- Dashboard cache được invalidate | ✅ |
| HEALTH-004 | testCreateMealLog_CalculateCalories | Tính calo từ macros | User đã đăng nhập, chỉ có macros không có totalCalories | 1. Gọi `createMealLog()` với fatGrams, proteinGrams, carbsGrams<br>2. Service tính totalCalories = (fat*9) + (protein*4) + (carbs*4) | - totalCalories được tính chính xác<br>- MealLog được lưu với totalCalories đã tính | ✅ |
| HEALTH-004 | testCreateMealLog_UserNotFound | Thêm bữa ăn với user không tồn tại | UserId không tồn tại | 1. Gọi `createMealLog()` với userId không tồn tại | - Throw RuntimeException với message "User not found with id: {userId}"<br>- Không lưu vào database | ✅ |

## 5. Article Service Tests

| Test ID | Test Name | Description | Preconditions | Test Steps | Expected Results | Status |
|---------|-----------|-------------|---------------|------------|------------------|--------|
| ARTIC-LE-001 | testGetAllArticles_Success | Lấy danh sách bài viết | User đã đăng nhập | 1. Gọi `getAllArticles()` không có filter<br>2. Service lấy tất cả articles (cache miss)<br>3. Lưu vào cache | - Trả về danh sách articles<br>- Articles được lưu vào cache (30 phút)<br>- Mỗi article có thông tin đầy đủ | ✅ |
| ARTIC-LE-001 | testGetAllArticles_WithKeyword | Tìm kiếm bài viết theo từ khóa | User đã đăng nhập | 1. Gọi `getAllArticles()` với keyword="dinh dưỡng"<br>2. Service tìm kiếm theo keyword | - Trả về danh sách articles chứa keyword trong title hoặc content<br>- Kết quả được lọc đúng | ✅ |
| ARTIC-LE-001 | testGetAllArticles_WithCategory | Lọc bài viết theo category | User đã đăng nhập | 1. Gọi `getAllArticles()` với categoryId=1<br>2. Service lọc theo category | - Trả về danh sách articles thuộc category<br>- Kết quả được lọc đúng | ✅ |
| ARTIC-LE-001 | testGetAllArticles_WithKeywordAndCategory | Tìm kiếm và lọc kết hợp | User đã đăng nhập | 1. Gọi `getAllArticles()` với keyword và categoryId<br>2. Service tìm kiếm và lọc | - Trả về danh sách articles thỏa cả keyword và category | ✅ |
| ARTIC-LE-001 | testGetAllArticles_FromCache | Lấy danh sách từ cache | Articles đã được cache | 1. Gọi `getAllArticles()`<br>2. Service lấy từ cache | - Trả về từ cache<br>- Không query database | ✅ |
| ARTIC-LE-004 | testVoteArticle_Success | Vote bài viết thành công | User đã đăng nhập, chưa vote bài viết này | 1. Gọi `voteArticle()` với articleId<br>2. Service kiểm tra user chưa vote<br>3. Tạo ArticleVote<br>4. Tăng voteCount của article<br>5. Xóa cache | - ArticleVote được tạo<br>- voteCount tăng lên<br>- Cache được xóa | ✅ |
| ARTIC-LE-004 | testVoteArticle_AlreadyVoted | Vote bài viết đã vote rồi | User đã vote bài viết này | 1. Gọi `voteArticle()` với articleId đã vote<br>2. Service kiểm tra user đã vote | - Throw RuntimeException với message "User has already voted for this article"<br>- voteCount không thay đổi | ✅ |
| ARTIC-LE-005 | testUnvoteArticle_Success | Bỏ vote bài viết thành công | User đã vote bài viết này | 1. Gọi `unvoteArticle()` với articleId<br>2. Service tìm ArticleVote<br>3. Xóa ArticleVote<br>4. Giảm voteCount của article<br>5. Xóa cache | - ArticleVote được xóa<br>- voteCount giảm xuống<br>- Cache được xóa | ✅ |
| ARTIC-LE-005 | testUnvoteArticle_NotVoted | Bỏ vote bài viết chưa vote | User chưa vote bài viết này | 1. Gọi `unvoteArticle()` với articleId chưa vote<br>2. Service không tìm thấy ArticleVote | - Throw RuntimeException với message "User has not voted for this article"<br>- voteCount không thay đổi | ✅ |
| ARTIC-LE-006 | testGetArticleById_Success | Xem chi tiết bài viết | User đã đăng nhập, article tồn tại | 1. Gọi `getArticleById()` với articleId<br>2. Service lấy article từ database (cache miss) | - Trả về ArticleResponseDTO với thông tin đầy đủ<br>- Article có category<br>- Có thông tin user đã vote hay chưa | ✅ |
| ARTIC-LE-006 | testGetArticleById_NotFound | Xem chi tiết bài viết không tồn tại | ArticleId không tồn tại | 1. Gọi `getArticleById()` với articleId không tồn tại | - Throw RuntimeException với message "Article not found with id: {articleId}" | ✅ |

## 6. Chat AI Service Tests

| Test ID | Test Name | Description | Preconditions | Test Steps | Expected Results | Status |
|---------|-----------|-------------|---------------|------------|------------------|--------|
| CHAT-001 | testProcessMessage_Success | Gửi tin nhắn cho AI thành công | User đã đăng nhập, API key đã cấu hình | 1. Gọi `processMessage()` với message="Làm sao giảm cân?"<br>2. Service đọc documentation<br>3. Kiểm tra có cần userData không<br>4. Gọi Gemini API<br>5. Parse response | - Trả về response từ AI<br>- Documentation được đọc<br>- Gemini API được gọi<br>- Response được parse đúng | ✅ |
| CHAT-002 | testProcessMessage_HealthQuestion | AI trả lời về sức khỏe | User đã đăng nhập, message chứa từ khóa cá nhân | 1. Gọi `processMessage()` với message="BMI của tôi?"<br>2. Service phát hiện cần userData<br>3. Lấy userData từ UserDataService<br>4. Gọi Gemini API với userData | - userData được lấy<br>- Gemini API được gọi với userData trong prompt<br>- Response chứa thông tin về BMI | ✅ |
| CHAT-003 | Chat Without Token | Chat không có token | - | Validation được xử lý ở Controller level | - | ⚠️ Controller Test |
| CHAT-004 | testProcessMessage_AIServiceDown | AI service không hoạt động | Gemini API không khả dụng | 1. Gọi `processMessage()` với message<br>2. Gemini API throw RuntimeException | - Trả về message lỗi chứa "lỗi" hoặc "thử lại"<br>- Exception được handle gracefully | ✅ |
| CHAT-004 | testProcessMessage_HttpError | Gemini API trả về HTTP error | Gemini API trả về HTTP 500 | 1. Gọi `processMessage()` với message<br>2. Gemini API throw HttpClientErrorException | - Trả về message lỗi chứa "lỗi" hoặc "thử lại"<br>- Exception được handle gracefully | ✅ |
| CHAT-004 | testProcessMessage_NoAPIKey | Chưa cấu hình API key | API key = null hoặc blank | 1. Gọi `processMessage()` với apiKey=null | - Trả về message "Chưa cấu hình Gemini API key. Vui lòng liên hệ quản trị viên."<br>- Không gọi Gemini API | ✅ |

## 7. Dashboard Service Tests

| Test ID | Test Name | Description | Preconditions | Test Steps | Expected Results | Status |
|---------|-----------|-------------|---------------|------------|------------------|--------|
| DASH-001 | testGetDashboardData_Success | Lấy dữ liệu dashboard thành công | User đã đăng nhập, có dữ liệu health và meals | 1. Gọi `getDashboardData()` với userId<br>2. Service lấy dữ liệu từ các repositories (cache miss)<br>3. Tính toán healthScore, highlights, weeklyReport<br>4. Lấy top 2 articles<br>5. Lưu vào cache | - Trả về DashboardDTO đầy đủ<br>- healthScore được tính<br>- highlights có dữ liệu<br>- weeklyReport có dữ liệu<br>- blogs có top 2 articles<br>- Cache được lưu (10 phút) | ✅ |
| DASH-001 | testGetDashboardData_FromCache | Lấy dashboard từ cache | Dashboard đã được cache | 1. Gọi `getDashboardData()` với userId<br>2. Service lấy từ cache | - Trả về từ cache<br>- Không query database | ✅ |
| DASH-002 | testInvalidateDashboardCache | Xóa cache dashboard | Dashboard đã được cache | 1. Gọi `invalidateDashboardCache()` với userId<br>2. Service xóa cache | - Cache được xóa thành công<br>- Lần gọi tiếp theo sẽ query database | ✅ |

## 8. User Data Service Tests

| Test ID | Test Name | Description | Preconditions | Test Steps | Expected Results | Status |
|---------|-----------|-------------|---------------|------------|------------------|--------|
| USER-DATA-001 | testGetUserSummary_Success | Lấy tóm tắt thông tin user | User đã đăng nhập, có profile và goal | 1. Gọi `getUserSummary()` với userId<br>2. Service lấy thông tin user, profile, goal, healthData, meals<br>3. Format thành string | - Trả về string chứa "THÔNG TIN NGƯỜI DÙNG"<br>- Có email của user<br>- Có "HỒ SƠ" với thông tin profile<br>- Có "MỤC TIÊU" với thông tin goal | ✅ |
| USER-DATA-001 | testGetUserSummary_UserNotFound | Lấy tóm tắt với user không tồn tại | UserId không tồn tại | 1. Gọi `getUserSummary()` với userId không tồn tại | - Trả về string chứa "Không tìm thấy" | ✅ |
| USER-DATA-001 | testGetUserSummary_WithHealthData | Lấy tóm tắt có dữ liệu sức khỏe | User có healthData entries | 1. Gọi `getUserSummary()` với userId có healthData<br>2. Service lấy healthData | - Trả về string chứa "DỮ LIỆU SỨC KHỎE"<br>- Có thông tin healthData | ✅ |

## 9. Document Service Tests

| Test ID | Test Name | Description | Preconditions | Test Steps | Expected Results | Status |
|---------|-----------|-------------|---------------|------------|------------------|--------|
| DOC-001 | testReadDocumentation | Đọc tài liệu hướng dẫn | File documentation tồn tại | 1. Gọi `readDocumentation()`<br>2. Service đọc file documentation | - Trả về nội dung file documentation<br>- Hoặc error message nếu không đọc được | ✅ |
| DOC-002 | testGetRelevantSection | Lấy section liên quan | File documentation tồn tại, có section chứa keyword | 1. Gọi `getRelevantSection()` với keyword="dinh dưỡng"<br>2. Service tìm section chứa keyword | - Trả về section liên quan đến keyword<br>- Hoặc toàn bộ documentation nếu không tìm thấy | ✅ |
| DOC-002 | testGetRelevantSection_NotFound | Lấy section không tồn tại | File documentation tồn tại, không có section chứa keyword | 1. Gọi `getRelevantSection()` với keyword không tồn tại<br>2. Service không tìm thấy section | - Trả về toàn bộ documentation | ✅ |

---

## Tổng Kết

- **Tổng số test cases**: 46
- **Test cases đã implement**: 46
- **Test cases cần test ở Controller level**: 3 (AUTH-003, AUTH-004, GOAL-003, CHAT-003)

### Ghi chú:
- ✅ = Test đã được implement và pass
- ⚠️ = Test cần được implement ở Controller level (validation tests)

