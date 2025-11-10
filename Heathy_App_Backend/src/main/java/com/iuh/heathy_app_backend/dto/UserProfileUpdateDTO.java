package com.iuh.heathy_app_backend.dto;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class UserProfileUpdateDTO {

    private String fullName;

    @NotNull(message = "Date of birth cannot be null.")
    private LocalDate dateOfBirth;

    private String avatar;

    @NotNull(message = "Height cannot be null.")
    @Min(value = 100, message = "Height must be at least 100cm.")
    @Max(value = 250, message = "Height cannot exceed 250cm.")
    private Double heightCm;

    @NotNull(message = "Weight cannot be null.")
    @Min(value = 30, message = "Weight must be at least 30kg.")
    @Max(value = 300, message = "Weight cannot exceed 300kg.")
    private Double weightKg;

    @NotBlank(message = "Gender cannot be blank.")
    private String gender;
}