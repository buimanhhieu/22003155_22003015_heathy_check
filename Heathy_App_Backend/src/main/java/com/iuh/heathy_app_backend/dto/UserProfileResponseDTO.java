package com.iuh.heathy_app_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponseDTO {
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private LocalDate dateOfBirth;
    private String avatar;
    private Double heightCm;
    private Double weightKg;
    private String gender;
}




















