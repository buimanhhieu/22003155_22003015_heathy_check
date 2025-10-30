package com.iuh.heathy_app_backend.dto;

import com.iuh.heathy_app_backend.entity.HealthMetricType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HealthDataResponseDTO {
    private Long id;
    private HealthMetricType metricType;
    private Double value;
    private String unit;
    private OffsetDateTime recordedAt;
}


