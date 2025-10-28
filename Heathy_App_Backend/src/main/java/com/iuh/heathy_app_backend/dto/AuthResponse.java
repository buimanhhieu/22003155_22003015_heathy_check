package com.iuh.heathy_app_backend.dto;

import lombok.*;

@Data
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String name;

    public AuthResponse(String accessToken, Long id, String email, String name) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.name = name;
    }
}