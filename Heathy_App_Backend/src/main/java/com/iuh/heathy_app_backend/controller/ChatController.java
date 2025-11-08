package com.iuh.heathy_app_backend.controller;

import com.iuh.heathy_app_backend.dto.ChatMessage;
import com.iuh.heathy_app_backend.service.ChatAIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatController {
    
    private final ChatAIService chatAIService;
    
    /**
     * Xử lý message từ client
     * Client gửi message đến /app/chat.sendMessage
     * Server sẽ broadcast đến /topic/public
     */
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        try {
            // Lấy userId từ session hoặc từ message
            Long userId = chatMessage.getUserId();
            
            if (userId == null) {
                // Nếu không có userId trong message, thử lấy từ session
                Object userIdObj = headerAccessor.getSessionAttributes().get("userId");
                if (userIdObj != null) {
                    userId = Long.parseLong(userIdObj.toString());
                } else {
                    // Trả về message lỗi
                    ChatMessage errorMessage = new ChatMessage();
                    errorMessage.setContent("Vui lòng đăng nhập để sử dụng tính năng chat.");
                    errorMessage.setSender("System");
                    errorMessage.setType(ChatMessage.MessageType.CHAT);
                    return errorMessage;
                }
            }
            
            // Xử lý message bằng AI
            String aiResponse = chatAIService.processMessage(chatMessage.getContent(), userId);
            
            // Tạo response message
            ChatMessage response = new ChatMessage();
            response.setContent(aiResponse);
            response.setSender("AI Assistant");
            response.setType(ChatMessage.MessageType.CHAT);
            response.setUserId(userId);
            
            return response;
        } catch (Exception e) {
            log.error("Error processing chat message", e);
            ChatMessage errorMessage = new ChatMessage();
            errorMessage.setContent("Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.");
            errorMessage.setSender("System");
            errorMessage.setType(ChatMessage.MessageType.CHAT);
            return errorMessage;
        }
    }
    
    /**
     * Xử lý khi user join chat
     */
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        // Lưu userId vào session
        if (chatMessage.getUserId() != null) {
            headerAccessor.getSessionAttributes().put("userId", chatMessage.getUserId());
        }
        
        // Thông báo user đã join
        chatMessage.setType(ChatMessage.MessageType.JOIN);
        return chatMessage;
    }
}

