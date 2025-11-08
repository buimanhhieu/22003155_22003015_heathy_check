package com.iuh.heathy_app_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private String content;
    private String sender;
    private MessageType type;
    private Long userId; // ID của user đang chat
    
    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE
    }
}

