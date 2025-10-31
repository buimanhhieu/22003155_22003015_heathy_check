package com.iuh.heathy_app_backend.dto;

import lombok.Data;

@Data
public class WeeklyReportDTO {
    private int totalSteps;
    private double totalWater;
    private double totalWorkoutDuration;
    private double totalSleepDuration;
    private String formattedWorkoutDuration;
    private String formattedSleepDuration;
}

















