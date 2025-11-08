package com.iuh.heathy_app_backend.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String message;
    private Long userId;
}

