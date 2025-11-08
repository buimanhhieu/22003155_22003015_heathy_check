package com.iuh.heathy_app_backend.dto;

import com.iuh.heathy_app_backend.entity.MealType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealLogResponseDTO {
    private Long id;
    private String mealName;
    private MealType mealType;
    private Double totalCalories;
    private Double fatGrams;
    private Double proteinGrams;
    private Double carbsGrams;
    private OffsetDateTime loggedAt;
}












