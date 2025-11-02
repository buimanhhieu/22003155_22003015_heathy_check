package com.iuh.heathy_app_backend.controller;

import com.iuh.heathy_app_backend.dto.DashboardDTO;
import com.iuh.heathy_app_backend.dto.UserGoalUpdateDTO;
import com.iuh.heathy_app_backend.dto.UserProfileUpdateDTO;
import com.iuh.heathy_app_backend.dto.UserProfileResponseDTO;
import com.iuh.heathy_app_backend.dto.MenstrualCycleRequest;
import com.iuh.heathy_app_backend.dto.ChangePasswordRequest;
import com.iuh.heathy_app_backend.dto.MessageResponse;
import com.iuh.heathy_app_backend.entity.UserGoal;
import com.iuh.heathy_app_backend.entity.UserProfile;
import com.iuh.heathy_app_backend.entity.MenstrualCycle;
import com.iuh.heathy_app_backend.entity.MealLog;
import com.iuh.heathy_app_backend.dto.MealLogRequestDTO;
import com.iuh.heathy_app_backend.dto.MealLogResponseDTO;
import com.iuh.heathy_app_backend.service.DashboardService;
import com.iuh.heathy_app_backend.service.UserService;
import com.iuh.heathy_app_backend.service.MealLogService;
import com.iuh.heathy_app_backend.repository.MealLogRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final DashboardService dashboardService;
    private final MealLogRepository mealLogRepository;
    private final MealLogService mealLogService;

    public UserController(UserService userService, DashboardService dashboardService, MealLogRepository mealLogRepository, MealLogService mealLogService) {
        this.userService = userService;
        this.dashboardService = dashboardService;
        this.mealLogRepository = mealLogRepository;
        this.mealLogService = mealLogService;
    }


    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfileResponseDTO> getUserProfile(@PathVariable Long id) {
        UserProfileResponseDTO profile = userService.getUserProfileResponse(id);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<UserProfile> updateUserProfile(
            @PathVariable Long id,
            @Valid @RequestBody UserProfileUpdateDTO profileDto) {
        UserProfile updatedProfile = userService.updateUserProfile(id, profileDto);
        return ResponseEntity.ok(updatedProfile);
    }
    @PutMapping("/{id}/goals") // Hoặc @PostMapping
    public ResponseEntity<UserGoal> updateUserGoals(
            @PathVariable Long id,
            @Valid @RequestBody UserGoalUpdateDTO goalDto) {
        UserGoal updatedGoal = userService.updateUserGoal(id, goalDto);
        return ResponseEntity.ok(updatedGoal);
    }

    @PostMapping("/{id}/menstrual-cycle")
    public ResponseEntity<MenstrualCycle> createMenstrualCycle(
            @PathVariable Long id,
            @RequestBody MenstrualCycleRequest cycleRequest) {
        MenstrualCycle cycle = userService.createMenstrualCycle(id, cycleRequest);
        return ResponseEntity.ok(cycle);
    }

    @PutMapping("/{id}/menstrual-cycle")
    public ResponseEntity<MenstrualCycle> updateMenstrualCycle(
            @PathVariable Long id,
            @RequestBody MenstrualCycleRequest cycleRequest) {
        MenstrualCycle cycle = userService.updateMenstrualCycle(id, cycleRequest);
        return ResponseEntity.ok(cycle);
    }

    @GetMapping("/{id}/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard(@PathVariable Long id) {
        DashboardDTO dashboard = dashboardService.getDashboardData(id);
        return ResponseEntity.ok(dashboard);
    }

    @PutMapping("/{id}/change-password")
    public ResponseEntity<MessageResponse> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        try {
            userService.changePassword(id, changePasswordRequest);
            return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Current password is incorrect")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("Current password is incorrect"));
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Failed to change password"));
        }
    }

    @GetMapping("/{id}/meal-logs")
    public ResponseEntity<List<MealLogResponseDTO>> getMealLogs(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<MealLogResponseDTO> mealLogs = mealLogService.getMealLogs(id, date);
        return ResponseEntity.ok(mealLogs);
    }
    
    @PostMapping("/{id}/meal-logs")
    public ResponseEntity<MealLogResponseDTO> createMealLog(
            @PathVariable Long id,
            @Valid @RequestBody MealLogRequestDTO requestDTO) {
        MealLogResponseDTO mealLog = mealLogService.createMealLog(id, requestDTO);
        return ResponseEntity.ok(mealLog);
    }
    
    @PutMapping("/{id}/meal-logs/{mealLogId}")
    public ResponseEntity<MealLogResponseDTO> updateMealLog(
            @PathVariable Long id,
            @PathVariable Long mealLogId,
            @Valid @RequestBody MealLogRequestDTO requestDTO) {
        MealLogResponseDTO mealLog = mealLogService.updateMealLog(id, mealLogId, requestDTO);
        return ResponseEntity.ok(mealLog);
    }
    
    @DeleteMapping("/{id}/meal-logs/{mealLogId}")
    public ResponseEntity<Void> deleteMealLog(
            @PathVariable Long id,
            @PathVariable Long mealLogId) {
        mealLogService.deleteMealLog(id, mealLogId);
        return ResponseEntity.ok().build();
    }
}