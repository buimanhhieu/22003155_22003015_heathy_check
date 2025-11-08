package com.iuh.heathy_app_backend.service;

import com.iuh.heathy_app_backend.dto.MealLogRequestDTO;
import com.iuh.heathy_app_backend.dto.MealLogResponseDTO;
import com.iuh.heathy_app_backend.entity.MealLog;
import com.iuh.heathy_app_backend.entity.MealType;
import com.iuh.heathy_app_backend.entity.User;
import com.iuh.heathy_app_backend.repository.MealLogRepository;
import com.iuh.heathy_app_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class MealLogService {
    
    private final MealLogRepository mealLogRepository;
    private final UserRepository userRepository;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private DashboardService dashboardService;
    
    private static final String MEAL_LOGS_CACHE_KEY = "meal-logs:";
    private static final long MEAL_LOGS_CACHE_TTL = 10; // 10 phút
    
    // Default macro distribution: Fat 30%, Protein 30%, Carbs 40%
    private static final double FAT_PERCENTAGE = 0.30;
    private static final double PROTEIN_PERCENTAGE = 0.30;
    private static final double CARBS_PERCENTAGE = 0.40;
    
    // Calories per gram
    private static final double CALORIES_PER_GRAM_FAT = 9.0;
    private static final double CALORIES_PER_GRAM_PROTEIN = 4.0;
    private static final double CALORIES_PER_GRAM_CARBS = 4.0;
    
    public MealLogService(MealLogRepository mealLogRepository, UserRepository userRepository) {
        this.mealLogRepository = mealLogRepository;
        this.userRepository = userRepository;
    }
    
    @Transactional
    public MealLogResponseDTO createMealLog(Long userId, MealLogRequestDTO requestDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        MealLog mealLog = new MealLog();
        mealLog.setUser(user);
        mealLog.setMealName(requestDTO.getMealName());
        mealLog.setMealType(requestDTO.getMealType() != null ? requestDTO.getMealType() : MealType.SNACK);
        
        // Calculate and set values
        calculateAndSetNutritionValues(mealLog, requestDTO);
        
        // Set logged time
        if (requestDTO.getLoggedAt() != null) {
            mealLog.setLoggedAt(requestDTO.getLoggedAt());
        } else {
            mealLog.setLoggedAt(OffsetDateTime.now());
        }
        
        MealLog saved = mealLogRepository.save(mealLog);
        
        // Invalidate cache
        invalidateMealLogsCache(userId);
        dashboardService.invalidateDashboardCache(userId); // Dashboard có nutrition data
        
        return convertToResponseDTO(saved);
    }
    
    /**
     * Calculate and set nutrition values based on input
     * Rules:
     * 1. If all macros provided: validate and use them
     * 2. If only calories provided: calculate macros from default distribution
     * 3. If calories + some macros: calculate remaining macros from remaining calories
     * 4. If only macros provided: calculate calories from macros
     */
    private void calculateAndSetNutritionValues(MealLog mealLog, MealLogRequestDTO requestDTO) {
        Double calories = requestDTO.getTotalCalories();
        Double fat = requestDTO.getFatGrams();
        Double protein = requestDTO.getProteinGrams();
        Double carbs = requestDTO.getCarbsGrams();
        
        // Case 1: Only macros provided, calculate calories
        if (calories == null && (fat != null || protein != null || carbs != null)) {
            double calculatedCalories = 0;
            if (fat != null) calculatedCalories += fat * CALORIES_PER_GRAM_FAT;
            if (protein != null) calculatedCalories += protein * CALORIES_PER_GRAM_PROTEIN;
            if (carbs != null) calculatedCalories += carbs * CALORIES_PER_GRAM_CARBS;
            calories = calculatedCalories;
        }
        
        // Case 2: Only calories provided, calculate all macros
        if (calories != null && fat == null && protein == null && carbs == null) {
            fat = (calories * FAT_PERCENTAGE) / CALORIES_PER_GRAM_FAT;
            protein = (calories * PROTEIN_PERCENTAGE) / CALORIES_PER_GRAM_PROTEIN;
            carbs = (calories * CARBS_PERCENTAGE) / CALORIES_PER_GRAM_CARBS;
        }
        
        // Case 3: Calories + some macros provided, calculate remaining
        if (calories != null) {
            double caloriesUsed = 0;
            if (fat != null) caloriesUsed += fat * CALORIES_PER_GRAM_FAT;
            if (protein != null) caloriesUsed += protein * CALORIES_PER_GRAM_PROTEIN;
            if (carbs != null) caloriesUsed += carbs * CALORIES_PER_GRAM_CARBS;
            
            double remainingCalories = calories - caloriesUsed;
            
            // If calories are less than used, we have a problem
            if (remainingCalories < 0) {
                // Adjust: reduce the provided macros proportionally
                double adjustmentFactor = calories / caloriesUsed;
                if (fat != null) fat *= adjustmentFactor;
                if (protein != null) protein *= adjustmentFactor;
                if (carbs != null) carbs *= adjustmentFactor;
                remainingCalories = 0;
            }
            
            // Calculate missing macros from remaining calories
            if (fat == null && protein == null && carbs == null) {
                // All missing, use default distribution
                fat = (remainingCalories * FAT_PERCENTAGE) / CALORIES_PER_GRAM_FAT;
                protein = (remainingCalories * PROTEIN_PERCENTAGE) / CALORIES_PER_GRAM_PROTEIN;
                carbs = (remainingCalories * CARBS_PERCENTAGE) / CALORIES_PER_GRAM_CARBS;
            } else {
                // Calculate missing macros
                double remainingPercentage = FAT_PERCENTAGE + PROTEIN_PERCENTAGE + CARBS_PERCENTAGE;
                if (fat == null) remainingPercentage -= FAT_PERCENTAGE;
                if (protein == null) remainingPercentage -= PROTEIN_PERCENTAGE;
                if (carbs == null) remainingPercentage -= CARBS_PERCENTAGE;
                
                if (remainingPercentage > 0) {
                    if (fat == null) {
                        fat = (remainingCalories * FAT_PERCENTAGE / remainingPercentage) / CALORIES_PER_GRAM_FAT;
                    }
                    if (protein == null) {
                        protein = (remainingCalories * PROTEIN_PERCENTAGE / remainingPercentage) / CALORIES_PER_GRAM_PROTEIN;
                    }
                    if (carbs == null) {
                        carbs = (remainingCalories * CARBS_PERCENTAGE / remainingPercentage) / CALORIES_PER_GRAM_CARBS;
                    }
                }
            }
        }
        
        // Validate: calories should match macros
        if (calories != null) {
            double calculatedCalories = 
                (fat != null ? fat * CALORIES_PER_GRAM_FAT : 0) +
                (protein != null ? protein * CALORIES_PER_GRAM_PROTEIN : 0) +
                (carbs != null ? carbs * CALORIES_PER_GRAM_CARBS : 0);
            
            // Allow 5% tolerance
            if (Math.abs(calculatedCalories - calories) / calories > 0.05) {
                // Adjust calories to match
                calories = calculatedCalories;
            }
        }
        
        mealLog.setTotalCalories(calories != null ? calories : 0.0);
        mealLog.setFatGrams(fat != null ? Math.max(0, fat) : 0.0);
        mealLog.setProteinGrams(protein != null ? Math.max(0, protein) : 0.0);
        mealLog.setCarbsGrams(carbs != null ? Math.max(0, carbs) : 0.0);
    }
    
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<MealLogResponseDTO> getMealLogs(Long userId, java.time.LocalDate date) {
        if (date == null) {
            date = java.time.LocalDate.now();
        }
        
        // Tạo cache key
        String dateStr = date.format(DateTimeFormatter.ISO_DATE);
        String cacheKey = MEAL_LOGS_CACHE_KEY + userId + ":" + dateStr;
        
        // Kiểm tra cache
        List<MealLogResponseDTO> cachedMealLogs = (List<MealLogResponseDTO>) redisTemplate.opsForValue().get(cacheKey);
        if (cachedMealLogs != null) {
            return cachedMealLogs;
        }
        
        // Query từ database
        OffsetDateTime startOfDay = date.atStartOfDay().atOffset(OffsetDateTime.now().getOffset());
        OffsetDateTime endOfDay = startOfDay.plusDays(1);
        
        List<MealLog> mealLogs = mealLogRepository.findByUserIdAndDateRange(userId, startOfDay, endOfDay);
        List<MealLogResponseDTO> mealLogDTOs = mealLogs.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
        
        // Lưu vào cache
        redisTemplate.opsForValue().set(cacheKey, mealLogDTOs, MEAL_LOGS_CACHE_TTL, TimeUnit.MINUTES);
        
        return mealLogDTOs;
    }
    
    @Transactional
    public MealLogResponseDTO updateMealLog(Long userId, Long mealLogId, MealLogRequestDTO requestDTO) {
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Find meal log
        MealLog mealLog = mealLogRepository.findById(mealLogId)
                .orElseThrow(() -> new RuntimeException("Meal log not found with id: " + mealLogId + ". Use POST to create a new meal log."));
        
        // Verify ownership
        if (!mealLog.getUser().getId().equals(userId)) {
            throw new RuntimeException("Meal log does not belong to user");
        }
        
        // Update fields
        if (requestDTO.getMealName() != null) {
            mealLog.setMealName(requestDTO.getMealName());
        }
        if (requestDTO.getMealType() != null) {
            mealLog.setMealType(requestDTO.getMealType());
        }
        
        // Recalculate nutrition values
        calculateAndSetNutritionValues(mealLog, requestDTO);
        
        if (requestDTO.getLoggedAt() != null) {
            mealLog.setLoggedAt(requestDTO.getLoggedAt());
        }
        
        MealLog saved = mealLogRepository.save(mealLog);
        
        // Invalidate cache
        invalidateMealLogsCache(userId);
        dashboardService.invalidateDashboardCache(userId);
        
        return convertToResponseDTO(saved);
    }
    
    @Transactional
    public void deleteMealLog(Long userId, Long mealLogId) {
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Find meal log
        MealLog mealLog = mealLogRepository.findById(mealLogId)
                .orElseThrow(() -> new RuntimeException("Meal log not found with id: " + mealLogId));
        
        // Verify ownership
        if (!mealLog.getUser().getId().equals(userId)) {
            throw new RuntimeException("Meal log does not belong to user");
        }
        
        mealLogRepository.delete(mealLog);
        
        // Invalidate cache
        invalidateMealLogsCache(userId);
        dashboardService.invalidateDashboardCache(userId);
    }
    
    private void invalidateMealLogsCache(Long userId) {
        // Xóa cache meal logs của user này (có thể dùng pattern matching nếu cần)
        // Đơn giản nhất là xóa cache của hôm nay và các ngày gần đây
        java.time.LocalDate today = java.time.LocalDate.now();
        String todayKey = MEAL_LOGS_CACHE_KEY + userId + ":" + today.format(DateTimeFormatter.ISO_DATE);
        redisTemplate.delete(todayKey);
        
        // Có thể thêm logic để xóa cache của các ngày khác nếu cần
    }
    
    private MealLogResponseDTO convertToResponseDTO(MealLog mealLog) {
        return new MealLogResponseDTO(
                mealLog.getId(),
                mealLog.getMealName(),
                mealLog.getMealType(),
                mealLog.getTotalCalories(),
                mealLog.getFatGrams(),
                mealLog.getProteinGrams(),
                mealLog.getCarbsGrams(),
                mealLog.getLoggedAt()
        );
    }
}

