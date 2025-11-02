package com.iuh.heathy_app_backend.dto;

import com.iuh.heathy_app_backend.entity.HealthMetricType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class HealthDataDTO {
    
    @NotNull(message = "Metric type cannot be null")
    private HealthMetricType metricType;
    
    @NotNull(message = "Value cannot be null")
    private Double value;
    
    private String unit;
    
    private OffsetDateTime recordedAt;
}













