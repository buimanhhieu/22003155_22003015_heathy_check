package com.iuh.heathy_app_backend.dto;

public enum ActivityLevel {
    SEDENTARY(1.2),      // Ít vận động
    LIGHTLY_ACTIVE(1.375), // Vận động nhẹ
    MODERATELY_ACTIVE(1.55),// Vận động vừa
    VERY_ACTIVE(1.725),    // Vận động nhiều
    EXTRA_ACTIVE(1.9);     // Rất nặng

    public final double multiplier;

    ActivityLevel(double multiplier) {
        this.multiplier = multiplier;
    }
}
