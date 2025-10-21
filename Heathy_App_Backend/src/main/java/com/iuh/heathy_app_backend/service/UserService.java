package com.iuh.heathy_app_backend.service;

import com.iuh.heathy_app_backend.dto.UserGoalUpdateDTO;
import com.iuh.heathy_app_backend.dto.UserProfileUpdateDTO;
import com.iuh.heathy_app_backend.dto.UserProfileResponseDTO;
import com.iuh.heathy_app_backend.dto.MenstrualCycleRequest;
import com.iuh.heathy_app_backend.entity.User;
import com.iuh.heathy_app_backend.entity.UserGoal;
import com.iuh.heathy_app_backend.entity.UserProfile;
import com.iuh.heathy_app_backend.entity.MenstrualCycle;
import com.iuh.heathy_app_backend.repository.UserGoalRepository;
import com.iuh.heathy_app_backend.repository.UserProfileRepository;
import com.iuh.heathy_app_backend.repository.UserRepository;
import com.iuh.heathy_app_backend.repository.MenstrualCycleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;

@Service
public class UserService {
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final UserGoalRepository userGoalRepository;
    private final MenstrualCycleRepository menstrualCycleRepository;

    public UserService(UserProfileRepository userProfileRepository, UserRepository userRepository, UserGoalRepository userGoalRepository, MenstrualCycleRepository menstrualCycleRepository) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
        this.userGoalRepository = userGoalRepository;
        this.menstrualCycleRepository = menstrualCycleRepository;
    }

    public UserProfile getUserProfile(Long userId) {
        return userProfileRepository.findByUserId(userId)
                .orElse(new UserProfile());
    }

    public UserProfileResponseDTO getUserProfileResponse(Long userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(new UserProfile());
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        return new UserProfileResponseDTO(
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

        return userProfileRepository.save(userProfile);
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

        return userGoalRepository.save(userGoal);
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
        
        return menstrualCycleRepository.save(cycle);
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
        
        return menstrualCycleRepository.save(existingCycle);
    }


}