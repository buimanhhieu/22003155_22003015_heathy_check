package com.iuh.heathy_app_backend.controller;

import com.iuh.heathy_app_backend.dto.DashboardDTO;
import com.iuh.heathy_app_backend.dto.UserGoalUpdateDTO;
import com.iuh.heathy_app_backend.dto.UserProfileUpdateDTO;
import com.iuh.heathy_app_backend.dto.UserProfileResponseDTO;
import com.iuh.heathy_app_backend.dto.MenstrualCycleRequest;
import com.iuh.heathy_app_backend.entity.UserGoal;
import com.iuh.heathy_app_backend.entity.UserProfile;
import com.iuh.heathy_app_backend.entity.MenstrualCycle;
import com.iuh.heathy_app_backend.service.DashboardService;
import com.iuh.heathy_app_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;
    private final DashboardService dashboardService;

    public UserController(UserService userService, DashboardService dashboardService) {
        this.userService = userService;
        this.dashboardService = dashboardService;
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
}