package com.iuh.heathy_app_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalTime;

@Data
public class UserGoalUpdateDTO {
    private Integer dailyStepsGoal;
    private LocalTime bedtime;
    private LocalTime wakeup;

    // Client chỉ cần gửi mức độ hoạt động, server sẽ tự tính toán calo
    @NotNull(message = "Activity level is required.")
    private ActivityLevel activityLevel;
}
