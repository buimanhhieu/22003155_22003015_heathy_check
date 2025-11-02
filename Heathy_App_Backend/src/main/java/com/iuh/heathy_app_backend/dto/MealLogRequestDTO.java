package com.iuh.heathy_app_backend.dto;

import com.iuh.heathy_app_backend.entity.MealType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class MealLogRequestDTO {
    private String mealName;
    private MealType mealType;
    
    @NotNull(message = "Total calories is required")
    @Positive(message = "Total calories must be positive")
    private Double totalCalories;
    
    private Double fatGrams;
    private Double proteinGrams;
    private Double carbsGrams;
    
    private OffsetDateTime loggedAt; // Optional, default will be now
}



