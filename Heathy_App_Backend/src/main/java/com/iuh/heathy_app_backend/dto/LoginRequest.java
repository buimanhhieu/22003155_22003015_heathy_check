package com.iuh.heathy_app_backend.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
@Data
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class LoginRequest {
    @NotBlank
    private String email;
    @NotBlank
    private String password;
}
