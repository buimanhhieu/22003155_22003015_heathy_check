package com.iuh.heathy_app_backend.controller;

import com.iuh.heathy_app_backend.dto.UserGoalUpdateDTO;
import com.iuh.heathy_app_backend.dto.UserProfileUpdateDTO;
import com.iuh.heathy_app_backend.entity.UserGoal;
import com.iuh.heathy_app_backend.entity.UserProfile;
import com.iuh.heathy_app_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }


    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfile> getUserProfile(@PathVariable Long id) {
        UserProfile profile = userService.getUserProfile(id);
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
}