package com.iuh.heathy_app_backend.service;

import com.iuh.heathy_app_backend.entity.*;
import com.iuh.heathy_app_backend.entity.HealthMetricType;
import com.iuh.heathy_app_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDataService {
    
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserGoalRepository userGoalRepository;
    private final HealthDataEntryRepository healthDataEntryRepository;
    private final MealLogRepository mealLogRepository;
    private final MenstrualCycleRepository menstrualCycleRepository;
    
    /**
     * Lấy thông tin tổng hợp về user để AI có thể trả lời câu hỏi
     */
    public String getUserSummary(Long userId) {
        StringBuilder summary = new StringBuilder();
        
        // Thông tin cơ bản
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return "Không tìm thấy thông tin người dùng.";
        }
        
        summary.append("THÔNG TIN NGƯỜI DÙNG:\n");
        summary.append("- Email: ").append(user.getEmail()).append("\n");
        summary.append("- Họ tên: ").append(user.getFullName() != null ? user.getFullName() : "Chưa cập nhật").append("\n");
        
        // Thông tin profile
        UserProfile profile = userProfileRepository.findById(userId).orElse(null);
        if (profile != null) {
            summary.append("\nHỒ SƠ:\n");
            if (profile.getDateOfBirth() != null) {
                summary.append("- Ngày sinh: ").append(profile.getDateOfBirth()).append("\n");
            }
            if (profile.getGender() != null) {
                summary.append("- Giới tính: ").append(profile.getGender()).append("\n");
            }
            if (profile.getHeightCm() != null) {
                summary.append("- Chiều cao: ").append(profile.getHeightCm()).append(" cm\n");
            }
            if (profile.getWeightKg() != null) {
                summary.append("- Cân nặng: ").append(profile.getWeightKg()).append(" kg\n");
            }
        }
        
        // Mục tiêu
        UserGoal goal = userGoalRepository.findById(userId).orElse(null);
        if (goal != null) {
            summary.append("\nMỤC TIÊU:\n");
            summary.append("- Bước chân hàng ngày: ").append(goal.getDailyStepsGoal()).append(" bước\n");
            summary.append("- Calo hàng ngày: ").append(goal.getDailyCaloriesGoal()).append(" calo\n");
            if (goal.getActivityLevel() != null) {
                summary.append("- Mức độ hoạt động: ").append(goal.getActivityLevel()).append("\n");
            }
            if (goal.getBedtime() != null) {
                summary.append("- Giờ đi ngủ: ").append(goal.getBedtime()).append("\n");
            }
            if (goal.getWakeup() != null) {
                summary.append("- Giờ thức dậy: ").append(goal.getWakeup()).append("\n");
            }
        }
        
        // Dữ liệu sức khỏe gần đây (7 ngày)
        OffsetDateTime weekAgo = OffsetDateTime.now().minusDays(7);
        List<HealthDataEntry> recentHealthData = healthDataEntryRepository
            .findRecentDataForHealthScore(userId, 
                List.of(HealthMetricType.STEPS, HealthMetricType.HEART_RATE, HealthMetricType.CALORIES_BURNED, HealthMetricType.SLEEP_DURATION),
                weekAgo);
        
        if (!recentHealthData.isEmpty()) {
            summary.append("\nDỮ LIỆU SỨC KHỎE 7 NGÀY GẦN ĐÂY:\n");
            recentHealthData.forEach(entry -> {
                summary.append("- ").append(entry.getMetricType())
                    .append(": ").append(entry.getValue())
                    .append(" ").append(entry.getUnit() != null ? entry.getUnit() : "")
                    .append(" (Ngày: ").append(entry.getRecordedAt().toLocalDate()).append(")\n");
            });
        }
        
        // Bữa ăn hôm nay
        OffsetDateTime startOfDay = LocalDate.now().atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime endOfDay = startOfDay.plusDays(1);
        List<MealLog> todayMeals = mealLogRepository.findByUserIdAndDateRange(userId, startOfDay, endOfDay);
        
        if (!todayMeals.isEmpty()) {
            summary.append("\nBỮA ĂN HÔM NAY:\n");
            double totalCalories = 0;
            for (MealLog meal : todayMeals) {
                summary.append("- ").append(meal.getMealName())
                    .append(" (").append(meal.getMealType()).append("): ")
                    .append(meal.getTotalCalories()).append(" calo\n");
                if (meal.getTotalCalories() != null) {
                    totalCalories += meal.getTotalCalories();
                }
            }
            summary.append("Tổng calo hôm nay: ").append(totalCalories).append(" calo\n");
        }
        
        // Chu kỳ kinh nguyệt (nếu có)
        MenstrualCycle latestCycle = menstrualCycleRepository.findLatestByUser(userId).orElse(null);
        if (latestCycle != null) {
            summary.append("\nCHU KỲ KINH NGUYỆT:\n");
            if (latestCycle.getStartDate() != null) {
                summary.append("- Ngày bắt đầu chu kỳ gần nhất: ").append(latestCycle.getStartDate()).append("\n");
            }
        }
        
        return summary.toString();
    }
}

