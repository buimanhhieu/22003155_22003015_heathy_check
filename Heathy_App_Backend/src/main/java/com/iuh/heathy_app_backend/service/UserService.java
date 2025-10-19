package com.iuh.heathy_app_backend.service;

import com.iuh.heathy_app_backend.dto.UserGoalUpdateDTO;
import com.iuh.heathy_app_backend.dto.UserProfileUpdateDTO;
import com.iuh.heathy_app_backend.entity.User;
import com.iuh.heathy_app_backend.entity.UserGoal;
import com.iuh.heathy_app_backend.entity.UserProfile;
import com.iuh.heathy_app_backend.repository.UserGoalRepository;
import com.iuh.heathy_app_backend.repository.UserProfileRepository;
import com.iuh.heathy_app_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;

@Service
public class UserService {
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;
    private final UserGoalRepository userGoalRepository;

    public UserService(UserProfileRepository userProfileRepository, UserRepository userRepository, UserGoalRepository userGoalRepository) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
        this.userGoalRepository = userGoalRepository;
    }

    public UserProfile getUserProfile(Long userId) {
        return userProfileRepository.findByUserId(userId)
                .orElse(new UserProfile());
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
}