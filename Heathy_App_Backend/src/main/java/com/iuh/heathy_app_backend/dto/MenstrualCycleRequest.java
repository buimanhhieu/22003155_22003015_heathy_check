package com.iuh.heathy_app_backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class MenstrualCycleRequest {
    
    @NotNull(message = "Start date cannot be null.")
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private Integer cycleLength; // Chu kỳ kinh nguyệt (ngày)
}

