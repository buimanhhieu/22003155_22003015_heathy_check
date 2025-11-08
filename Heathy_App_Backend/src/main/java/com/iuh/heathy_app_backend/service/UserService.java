package com.iuh.heathy_app_backend.service;

import com.iuh.heathy_app_backend.dto.UserGoalUpdateDTO;
import com.iuh.heathy_app_backend.dto.UserProfileUpdateDTO;
import com.iuh.heathy_app_backend.dto.UserProfileResponseDTO;
import com.iuh.heathy_app_backend.dto.MenstrualCycleRequest;
import com.iuh.heathy_app_backend.dto.ChangePasswordRequest;
import com.iuh.heathy_app_backend.entity.User;
import com.iuh.heathy_app_backend.entity.UserGoal;
import com.iuh.heathy_app_backend.entity.UserProfile;
import com.iuh.heathy_app_backend.entity.MenstrualCycle;
import com.iuh.heathy_app_backend.repository.UserGoalRepository;
import com.iuh.heathy_app_backend.repository.UserProfileRepository;
import com.iuh.heathy_app_backend.repository.UserRepository;
import com.iuh.heathy_app_backend.repository.MenstrualCycleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class UserService {
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final UserGoalRepository userGoalRepository;
    private final MenstrualCycleRepository menstrualCycleRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    @Lazy
    private DashboardService dashboardService;
    
    private static final String USER_PROFILE_CACHE_KEY = "user:profile:";
    private static final String USER_GOALS_CACHE_KEY = "user:goals:";
    private static final long USER_CACHE_TTL = 30; // 30 phút

    public UserService(UserProfileRepository userProfileRepository, UserRepository userRepository, UserGoalRepository userGoalRepository, MenstrualCycleRepository menstrualCycleRepository, PasswordEncoder passwordEncoder) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
        this.userGoalRepository = userGoalRepository;
        this.menstrualCycleRepository = menstrualCycleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserProfile getUserProfile(Long userId) {
        return userProfileRepository.findByUserId(userId)
                .orElse(new UserProfile());
    }

    public UserProfileResponseDTO getUserProfileResponse(Long userId) {
        String cacheKey = USER_PROFILE_CACHE_KEY + userId;
        
        // Kiểm tra cache
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            // Convert từ LinkedHashMap hoặc Object sang DTO
            if (cached instanceof UserProfileResponseDTO) {
                return (UserProfileResponseDTO) cached;
            } else {
                // Nếu là LinkedHashMap, convert sang DTO
                return objectMapper.convertValue(cached, UserProfileResponseDTO.class);
            }
        }
        
        // Query từ database
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(new UserProfile());
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        UserProfileResponseDTO profileDTO = new UserProfileResponseDTO(
            profile.getUserId(),
            user.getFullName(),
            user.getEmail(),
            user.getFullName(),
            profile.getDateOfBirth(),
            profile.getAvatar(),
            profile.getHeightCm(),
            profile.getWeightKg(),
            profile.getGender()
        );
        
        // Lưu vào cache
        redisTemplate.opsForValue().set(cacheKey, profileDTO, USER_CACHE_TTL, TimeUnit.MINUTES);
        
        return profileDTO;
    }
    
    public UserGoal getUserGoal(Long userId) {
        String cacheKey = USER_GOALS_CACHE_KEY + userId;
        
        // Kiểm tra cache
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            // Convert từ LinkedHashMap hoặc Object sang UserGoal
            if (cached instanceof UserGoal) {
                return (UserGoal) cached;
            } else {
                // Nếu là LinkedHashMap, convert sang UserGoal
                return objectMapper.convertValue(cached, UserGoal.class);
            }
        }
        
        // Query từ database
        Optional<UserGoal> goalOpt = userGoalRepository.findByUserId(userId);
        UserGoal goal = goalOpt.orElse(new UserGoal());
        
        // Lưu vào cache (chỉ cache nếu có goal)
        if (goalOpt.isPresent()) {
            redisTemplate.opsForValue().set(cacheKey, goal, USER_CACHE_TTL, TimeUnit.MINUTES);
        }
        
        return goal;
    }

    @Transactional
    public UserProfile updateUserProfile(Long userId, UserProfileUpdateDTO profileDto) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElse(new UserProfile());

        if (userProfile.getUserId() == null) {
            userProfile.setUser(user);
        }

        userProfile.setDateOfBirth(profileDto.getDateOfBirth());
        userProfile.setAvatar(profileDto.getAvatar());
        userProfile.setHeightCm(profileDto.getHeightCm());
        userProfile.setWeightKg(profileDto.getWeightKg());
        userProfile.setGender(profileDto.getGender()); // Cập nhật gender

        UserProfile updatedProfile = userProfileRepository.save(userProfile);
        
        // Invalidate cache
        invalidateUserProfileCache(userId);
        dashboardService.invalidateDashboardCache(userId); // Dashboard phụ thuộc vào profile
        
        return updatedProfile;
    }


    @Transactional
    public UserGoal updateUserGoal(Long userId, UserGoalUpdateDTO goalDto) {
        UserProfile userProfile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User profile not found for user id: " + userId));
        double weight = userProfile.getWeightKg();
        double height = userProfile.getHeightCm();
        int age = Period.between(userProfile.getDateOfBirth(), LocalDate.now()).getYears();
        String gender = userProfile.getGender(); // Giả sử có trường gender ("MALE", "FEMALE")

        double bmr;
        if ("MALE".equalsIgnoreCase(gender)) {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }
        double activityMultiplier = goalDto.getActivityLevel().multiplier;
        int dailyCaloriesGoal = (int) Math.round(bmr * activityMultiplier);
        UserGoal userGoal = userGoalRepository.findByUserId(userId).orElse(new UserGoal());
        userGoal.setUser(userProfile.getUser());
        userGoal.setDailyStepsGoal(goalDto.getDailyStepsGoal());
        userGoal.setBedtime(goalDto.getBedtime());
        userGoal.setWakeup(goalDto.getWakeup());
        userGoal.setDailyCaloriesGoal(dailyCaloriesGoal);
        userGoal.setActivityLevel(goalDto.getActivityLevel());

        UserGoal updatedGoal = userGoalRepository.save(userGoal);
        
        // Invalidate cache
        invalidateUserGoalsCache(userId);
        dashboardService.invalidateDashboardCache(userId); // Dashboard phụ thuộc vào goals
        
        return updatedGoal;
    }

    @Transactional
    public MenstrualCycle createMenstrualCycle(Long userId, MenstrualCycleRequest cycleRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        MenstrualCycle cycle = new MenstrualCycle();
        cycle.setUser(user);
        cycle.setStartDate(cycleRequest.getStartDate());
        
        // Tính toán endDate dựa trên startDate và cycleLength
        if (cycleRequest.getEndDate() != null) {
            cycle.setEndDate(cycleRequest.getEndDate());
        } else {
            // Nếu không có endDate, tính toán dựa trên cycleLength (mặc định 5 ngày)
            int periodLength = 5; // Độ dài chu kỳ kinh nguyệt (ngày)
            cycle.setEndDate(cycleRequest.getStartDate().plusDays(periodLength));
        }
        
        MenstrualCycle savedCycle = menstrualCycleRepository.save(cycle);
        
        // Invalidate dashboard cache vì cycle tracking có trong dashboard
        dashboardService.invalidateDashboardCache(userId);
        
        return savedCycle;
    }

    @Transactional
    public MenstrualCycle updateMenstrualCycle(Long userId, MenstrualCycleRequest cycleRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Tìm chu kỳ gần nhất để cập nhật
        MenstrualCycle existingCycle = menstrualCycleRepository.findLatestByUser(userId)
                .orElse(new MenstrualCycle());
        
        // Nếu không có existing cycle, tạo mới
        if (existingCycle.getId() == null) {
            existingCycle.setUser(user);
        }
        
        existingCycle.setStartDate(cycleRequest.getStartDate());
        
        // Tính toán endDate dựa trên startDate và cycleLength
        if (cycleRequest.getEndDate() != null) {
            existingCycle.setEndDate(cycleRequest.getEndDate());
        } else {
            // Nếu không có endDate, tính toán dựa trên cycleLength (mặc định 5 ngày)
            int periodLength = 5; // Độ dài chu kỳ kinh nguyệt (ngày)
            existingCycle.setEndDate(cycleRequest.getStartDate().plusDays(periodLength));
        }
        
        MenstrualCycle savedCycle = menstrualCycleRepository.save(existingCycle);
        
        // Invalidate dashboard cache vì cycle tracking có trong dashboard
        dashboardService.invalidateDashboardCache(userId);
        
        return savedCycle;
    }

    /**
     * Change user password
     * @param userId The user ID
     * @param changePasswordRequest The change password request containing current and new password
     * @throws RuntimeException if user not found or current password is incorrect
     */
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest changePasswordRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Verify current password
        if (!passwordEncoder.matches(changePasswordRequest.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Encode and set new password
        String encodedNewPassword = passwordEncoder.encode(changePasswordRequest.getNewPassword());
        user.setPasswordHash(encodedNewPassword);
        
        userRepository.save(user);
    }
    
    private void invalidateUserProfileCache(Long userId) {
        String cacheKey = USER_PROFILE_CACHE_KEY + userId;
        redisTemplate.delete(cacheKey);
    }
    
    private void invalidateUserGoalsCache(Long userId) {
        String cacheKey = USER_GOALS_CACHE_KEY + userId;
        redisTemplate.delete(cacheKey);
    }

}