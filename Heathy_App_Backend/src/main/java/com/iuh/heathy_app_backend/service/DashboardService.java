package com.iuh.heathy_app_backend.service;

import com.iuh.heathy_app_backend.dto.*;
import com.iuh.heathy_app_backend.entity.*;
import com.iuh.heathy_app_backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    
    @Autowired
    private HealthDataEntryRepository healthDataEntryRepository;
    
    @Autowired
    private MealLogRepository mealLogRepository;
    
    @Autowired
    private MenstrualCycleRepository menstrualCycleRepository;
    
    @Autowired
    private ArticleRepository articleRepository;
    
    @Autowired
    private UserGoalRepository userGoalRepository;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private static final String DASHBOARD_CACHE_KEY = "dashboard:";
    private static final long DASHBOARD_CACHE_TTL = 10; // 10 phút
    
    public DashboardDTO getDashboardData(Long userId) {
        // 1. Kiểm tra cache trước
        String cacheKey = DASHBOARD_CACHE_KEY + userId;
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        
        if (cached != null) {
            System.out.println("[DashboardService] Cache HIT for userId: " + userId);
            // Convert từ LinkedHashMap hoặc Object sang DashboardDTO
            if (cached instanceof DashboardDTO) {
                return (DashboardDTO) cached;
            } else {
                return objectMapper.convertValue(cached, DashboardDTO.class);
            }
        }
        
        System.out.println("[DashboardService] Cache MISS for userId: " + userId);
        
        // 2. Nếu không có trong cache, query từ database
        DashboardDTO dashboard = new DashboardDTO();
        
        // 1. Health Score
        dashboard.setHealthScore(calculateHealthScore(userId));
        
        // 2. Highlights
        dashboard.setHighlights(getHighlights(userId));
        
        // 3. Weekly Report
        dashboard.setWeeklyReport(getWeeklyReport(userId));
        
        // 4. Blogs
        dashboard.setBlogs(getBlogs());
        
        // 3. Lưu vào cache
        redisTemplate.opsForValue().set(cacheKey, dashboard, DASHBOARD_CACHE_TTL, TimeUnit.MINUTES);
        
        return dashboard;
    }
    
    // Method để invalidate cache khi có thay đổi
    public void invalidateDashboardCache(Long userId) {
        String cacheKey = DASHBOARD_CACHE_KEY + userId;
        redisTemplate.delete(cacheKey);
        System.out.println("[DashboardService] Cache invalidated for userId: " + userId);
    }
    
    private HealthScoreDTO calculateHealthScore(Long userId) {
        HealthScoreDTO healthScore = new HealthScoreDTO();
        
        // Lấy dữ liệu gần đây (24h qua)
        OffsetDateTime startTime = OffsetDateTime.now().minusHours(24);
        List<HealthMetricType> metricTypes = Arrays.asList(
            HealthMetricType.STEPS,
            HealthMetricType.SLEEP_DURATION,
            HealthMetricType.CALORIES_BURNED,
            HealthMetricType.HEART_RATE
        );
        
        List<HealthDataEntry> recentData = healthDataEntryRepository.findRecentDataForHealthScore(userId, metricTypes, startTime);
        
        // Lấy mục tiêu
        Optional<UserGoal> userGoalOpt = userGoalRepository.findByUserId(userId);
        UserGoal userGoal = userGoalOpt.orElse(new UserGoal());
        
        // Tính điểm cho từng chỉ số
        double totalScore = 0;
        int validMetrics = 0;
        
        for (HealthDataEntry entry : recentData) {
            double score = 0;
            switch (entry.getMetricType()) {
                case STEPS:
                    if (userGoal.getDailyStepsGoal() > 0) {
                        score = Math.min(100, (entry.getValue() / userGoal.getDailyStepsGoal()) * 100);
                    }
                    break;
                case SLEEP_DURATION:
                    // Tính sleep goal từ bedtime và wakeup (mặc định 8 giờ nếu không có)
                    double sleepGoal = 8.0;
                    if (userGoal.getBedtime() != null && userGoal.getWakeup() != null) {
                        long sleepMinutes = java.time.Duration.between(userGoal.getBedtime(), userGoal.getWakeup()).toMinutes();
                        if (sleepMinutes < 0) {
                            sleepMinutes += 24 * 60; // Nếu qua ngày
                        }
                        sleepGoal = sleepMinutes / 60.0;
                    }
                    if (sleepGoal > 0) {
                        score = Math.min(100, (entry.getValue() / sleepGoal) * 100);
                    }
                    break;
                case CALORIES_BURNED:
                    if (userGoal.getDailyCaloriesGoal() > 0) {
                        score = Math.min(100, (entry.getValue() / userGoal.getDailyCaloriesGoal()) * 100);
                    }
                    break;
                case HEART_RATE:
                    // Heart rate score dựa trên range bình thường (60-100 bpm)
                    if (entry.getValue() >= 60 && entry.getValue() <= 100) {
                        score = 100;
                    } else if (entry.getValue() < 60) {
                        score = Math.max(0, (entry.getValue() / 60) * 100);
                    } else {
                        score = Math.max(0, 100 - ((entry.getValue() - 100) / 40) * 100);
                    }
                    break;
            }
            totalScore += score;
            validMetrics++;
        }
        
        int finalScore = validMetrics > 0 ? (int) (totalScore / validMetrics) : 0;
        healthScore.setScore(finalScore);
        
        // Xác định status và message
        if (finalScore >= 80) {
            healthScore.setStatus("excellent");
            healthScore.setMessage("Sức khỏe của bạn đang rất tốt!");
        } else if (finalScore >= 60) {
            healthScore.setStatus("good");
            healthScore.setMessage("Sức khỏe của bạn đang ổn định.");
        } else if (finalScore >= 40) {
            healthScore.setStatus("fair");
            healthScore.setMessage("Cần cải thiện thêm một chút.");
        } else {
            healthScore.setStatus("poor");
            healthScore.setMessage("Hãy chú ý đến sức khỏe của bạn.");
        }
        
        return healthScore;
    }
    
    private HighlightsDTO getHighlights(Long userId) {
        HighlightsDTO highlights = new HighlightsDTO();
        
        // Steps
        highlights.setSteps(getStepsData(userId));
        
        // Cycle Tracking
        highlights.setCycleTracking(getCycleTrackingData(userId));
        
        // Sleep
        highlights.setSleep(getSleepData(userId));
        
        // Nutrition
        highlights.setNutrition(getNutritionData(userId));
        
        return highlights;
    }
    
    private StepsDTO getStepsData(Long userId) {
        StepsDTO steps = new StepsDTO();
        
        // Lấy dữ liệu steps hôm nay
        OffsetDateTime startOfDay = OffsetDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime endOfDay = startOfDay.plusDays(1);
        Optional<HealthDataEntry> stepsEntry = healthDataEntryRepository.findLatestTodayByUserAndMetric(userId, HealthMetricType.STEPS, startOfDay, endOfDay);
        int stepsValue = stepsEntry.map(entry -> entry.getValue().intValue()).orElse(0);
        steps.setValue(stepsValue);
        
        // Lấy mục tiêu
        Optional<UserGoal> userGoalOpt = userGoalRepository.findByUserId(userId);
        int goal = userGoalOpt.map(UserGoal::getDailyStepsGoal).orElse(10000);
        steps.setGoal(goal);
        steps.setPercentage(goal > 0 ? (double) stepsValue / goal * 100 : 0);
        
        // Last updated
        if (stepsEntry.isPresent()) {
            steps.setLastUpdated(formatLastUpdated(stepsEntry.get().getRecordedAt()));
        } else {
            steps.setLastUpdated("Chưa có dữ liệu");
        }
        
        return steps;
    }
    
    private CycleTrackingDTO getCycleTrackingData(Long userId) {
        CycleTrackingDTO cycleTracking = new CycleTrackingDTO();
        
        Optional<MenstrualCycle> latestCycle = menstrualCycleRepository.findLatestByUser(userId);
        
        if (latestCycle.isPresent()) {
            MenstrualCycle cycle = latestCycle.get();
            LocalDate lastCycleDate = cycle.getStartDate();
            
            // Kiểm tra nếu startDate là null (default cycle chưa được cập nhật)
            if (lastCycleDate == null) {
                cycleTracking.setStatus("Chưa có dữ liệu chu kỳ");
                cycleTracking.setDaysRemaining(0);
                cycleTracking.setLastCycleDate("Chưa có");
                cycleTracking.setNextCycleDate("Chưa có");
            } else {
                // Sử dụng endDate để tính toán chu kỳ tiếp theo
                LocalDate endDate = cycle.getEndDate();
                LocalDate referenceDate = (endDate != null) ? endDate : lastCycleDate;
                
                // Chu kỳ trung bình 28 ngày (có thể lấy từ cycleLength nếu có)
                int cycleLength = 28; // Default cycle length
                LocalDate nextCycleDate = referenceDate.plusDays(cycleLength);
                
                long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), nextCycleDate);
                
                cycleTracking.setLastCycleDate(lastCycleDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                cycleTracking.setNextCycleDate(nextCycleDate.format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
                cycleTracking.setDaysRemaining((int) daysRemaining);
                
                if (daysRemaining > 0) {
                    cycleTracking.setStatus("Chu kỳ tiếp theo trong " + daysRemaining + " ngày");
                } else {
                    cycleTracking.setStatus("Đã đến ngày dự kiến");
                }
            }
        } else {
            cycleTracking.setStatus("Chưa có dữ liệu chu kỳ");
            cycleTracking.setDaysRemaining(0);
            cycleTracking.setLastCycleDate("Chưa có");
            cycleTracking.setNextCycleDate("Chưa có");
        }
        
        return cycleTracking;
    }
    
    private SleepDTO getSleepData(Long userId) {
        SleepDTO sleep = new SleepDTO();
        
        // Lấy dữ liệu ngủ trong 36h qua
        OffsetDateTime startTime = OffsetDateTime.now().minusHours(36);
        Optional<HealthDataEntry> sleepEntry = healthDataEntryRepository.findLatestByUserAndMetricAndTimeRange(userId, HealthMetricType.SLEEP_DURATION, startTime);
        
        double sleepHours = sleepEntry.map(entry -> entry.getValue()).orElse(0.0);
        sleep.setHours(sleepHours);
        sleep.setFormatted(formatSleepDuration(sleepHours));
        
        // Lấy mục tiêu
        Optional<UserGoal> userGoalOpt = userGoalRepository.findByUserId(userId);
        double goal = 8.0; // Mặc định 8 giờ
        if (userGoalOpt.isPresent()) {
            UserGoal userGoal = userGoalOpt.get();
            if (userGoal.getBedtime() != null && userGoal.getWakeup() != null) {
                long sleepMinutes = java.time.Duration.between(userGoal.getBedtime(), userGoal.getWakeup()).toMinutes();
                if (sleepMinutes < 0) {
                    sleepMinutes += 24 * 60; // Nếu qua ngày
                }
                goal = sleepMinutes / 60.0;
            }
        }
        sleep.setGoal(goal);
        sleep.setPercentage(goal > 0 ? sleepHours / goal * 100 : 0);
        
        // Last updated
        if (sleepEntry.isPresent()) {
            sleep.setLastUpdated(formatLastUpdated(sleepEntry.get().getRecordedAt()));
        } else {
            sleep.setLastUpdated("Chưa có dữ liệu");
        }
        
        return sleep;
    }
    
    private NutritionDTO getNutritionData(Long userId) {
        NutritionDTO nutrition = new NutritionDTO();
        
        // Lấy tổng calo hôm nay - dùng LocalDate để tránh timezone issues (giống MealLogService)
        LocalDate today = LocalDate.now();
        OffsetDateTime startOfDay = today.atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
        OffsetDateTime endOfDay = startOfDay.plusDays(1);
        
        System.out.println("[DashboardService] Getting nutrition data for userId: " + userId + ", date: " + today);
        System.out.println("[DashboardService] Date range: " + startOfDay + " to " + endOfDay);
        
        // Thử 2 cách: dùng query SUM và dùng list để tính
        Object[] result = mealLogRepository.findDailyCaloriesAndLastUpdate(userId, startOfDay, endOfDay);
        List<MealLog> allMeals = mealLogRepository.findByUserIdAndDateRange(userId, startOfDay, endOfDay);
        
        System.out.println("[DashboardService] Query result: " + (result != null ? Arrays.toString(result) : "null"));
        System.out.println("[DashboardService] All meals count: " + (allMeals != null ? allMeals.size() : 0));
        
        // Tính tổng từ list meals (backup method)
        double totalKcalFromList = 0.0;
        OffsetDateTime lastUpdateFromList = null;
        if (allMeals != null && !allMeals.isEmpty()) {
            for (MealLog meal : allMeals) {
                if (meal.getTotalCalories() != null) {
                    totalKcalFromList += meal.getTotalCalories();
                }
                if (meal.getLoggedAt() != null) {
                    if (lastUpdateFromList == null || meal.getLoggedAt().isAfter(lastUpdateFromList)) {
                        lastUpdateFromList = meal.getLoggedAt();
                    }
                }
            }
        }
        System.out.println("[DashboardService] Calculated from list: totalKcal=" + totalKcalFromList + ", lastUpdate=" + lastUpdateFromList);
        
        // Xử lý an toàn kết quả từ database
        int totalKcal = 0;
        OffsetDateTime lastUpdate = null;
        
        if (result != null && result.length >= 2) {
            // Xử lý totalKcal - có thể là BigDecimal, Long, Double, hoặc null
            if (result[0] != null) {
                if (result[0] instanceof Number) {
                    totalKcal = ((Number) result[0]).intValue();
                } else if (result[0] instanceof String) {
                    try {
                        totalKcal = Integer.parseInt((String) result[0]);
                    } catch (NumberFormatException e) {
                        totalKcal = 0;
                    }
                }
            }
            
            // Xử lý lastUpdate
            if (result[1] instanceof OffsetDateTime) {
                lastUpdate = (OffsetDateTime) result[1];
            }
        }
        
        // Nếu query SUM trả về 0 nhưng có meals trong list, dùng giá trị từ list
        if (totalKcal == 0 && totalKcalFromList > 0) {
            totalKcal = (int) Math.round(totalKcalFromList);
            System.out.println("[DashboardService] Using calculated value from list: " + totalKcal);
        }
        
        // Nếu không có lastUpdate từ query, dùng từ list
        if (lastUpdate == null && lastUpdateFromList != null) {
            lastUpdate = lastUpdateFromList;
            System.out.println("[DashboardService] Using lastUpdate from list: " + lastUpdate);
        }
        
        System.out.println("[DashboardService] Final totalKcal: " + totalKcal);
        nutrition.setTotalKcal(totalKcal);
        
        // Lấy mục tiêu
        Optional<UserGoal> userGoalOpt = userGoalRepository.findByUserId(userId);
        int goal = userGoalOpt.map(UserGoal::getDailyCaloriesGoal).orElse(2000);
        nutrition.setGoal(goal);
        nutrition.setPercentage(goal > 0 ? (double) totalKcal / goal * 100 : 0);
        
        // Last updated
        if (lastUpdate != null) {
            nutrition.setLastUpdated(formatLastUpdated(lastUpdate));
        } else {
            nutrition.setLastUpdated("Chưa có dữ liệu");
        }
        
        return nutrition;
    }
    
    private WeeklyReportDTO getWeeklyReport(Long userId) {
        WeeklyReportDTO weeklyReport = new WeeklyReportDTO();
        
        // Lấy dữ liệu từ đầu tuần
        OffsetDateTime weekStart = OffsetDateTime.now().with(java.time.DayOfWeek.MONDAY).withHour(0).withMinute(0).withSecond(0);
        List<HealthMetricType> metricTypes = Arrays.asList(
            HealthMetricType.STEPS,
            HealthMetricType.WATER_INTAKE,
            HealthMetricType.WORKOUT_DURATION,
            HealthMetricType.SLEEP_DURATION
        );
        
        List<Object[]> weeklyData = healthDataEntryRepository.findWeeklyTotalsByUserAndMetrics(userId, weekStart, metricTypes);
        
        // Khởi tạo giá trị mặc định
        int totalSteps = 0;
        double totalWater = 0;
        double totalWorkoutDuration = 0;
        double totalSleepDuration = 0;
        
        // Xử lý dữ liệu
        for (Object[] row : weeklyData) {
            if (row != null && row.length >= 2) {
                HealthMetricType metricType = (HealthMetricType) row[0];
                Double value = 0.0;
                
                // Xử lý an toàn giá trị từ database
                if (row[1] != null) {
                    if (row[1] instanceof Number) {
                        value = ((Number) row[1]).doubleValue();
                    } else if (row[1] instanceof String) {
                        try {
                            value = Double.parseDouble((String) row[1]);
                        } catch (NumberFormatException e) {
                            value = 0.0;
                        }
                    }
                }
                
                switch (metricType) {
                    case STEPS:
                        totalSteps = value.intValue();
                        break;
                    case WATER_INTAKE:
                        totalWater = value;
                        break;
                    case WORKOUT_DURATION:
                        totalWorkoutDuration = value;
                        break;
                    case SLEEP_DURATION:
                        totalSleepDuration = value;
                        break;
                }
            }
        }
        
        weeklyReport.setTotalSteps(totalSteps);
        weeklyReport.setTotalWater(totalWater);
        weeklyReport.setTotalWorkoutDuration(totalWorkoutDuration);
        weeklyReport.setTotalSleepDuration(totalSleepDuration);
        weeklyReport.setFormattedWorkoutDuration(formatWorkoutDuration(totalWorkoutDuration));
        weeklyReport.setFormattedSleepDuration(formatSleepDuration(totalSleepDuration));
        
        return weeklyReport;
    }
    
    private List<BlogDTO> getBlogs() {
        List<Article> articles = articleRepository.findTop2ByOrderByPublishedAtDesc();
        return articles.stream().map(this::convertToBlogDTO).collect(Collectors.toList());
    }
    
    private BlogDTO convertToBlogDTO(Article article) {
        BlogDTO blog = new BlogDTO();
        blog.setId(article.getId());
        blog.setTitle(article.getTitle());
        blog.setCategoryName(article.getCategory() != null ? article.getCategory().getName() : "Không phân loại");
        blog.setVoteCount(article.getVoteCount());
        blog.setPublishedAt(article.getPublishedAt().toLocalDateTime());
        return blog;
    }
    
    // Helper methods
    private String formatLastUpdated(OffsetDateTime dateTime) {
        long minutes = ChronoUnit.MINUTES.between(dateTime, OffsetDateTime.now());
        if (minutes < 1) {
            return "Vừa cập nhật";
        } else if (minutes < 60) {
            return minutes + " phút trước";
        } else {
            long hours = ChronoUnit.HOURS.between(dateTime, OffsetDateTime.now());
            return hours + " giờ trước";
        }
    }
    
    private String formatSleepDuration(double hours) {
        int wholeHours = (int) hours;
        int minutes = (int) ((hours - wholeHours) * 60);
        return wholeHours + "h " + minutes + "min";
    }
    
    private String formatWorkoutDuration(double minutes) {
        int wholeMinutes = (int) minutes;
        int hours = wholeMinutes / 60;
        int remainingMinutes = wholeMinutes % 60;
        
        if (hours > 0) {
            return hours + "h " + remainingMinutes + "min";
        } else {
            return wholeMinutes + "min";
        }
    }
}
