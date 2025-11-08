package com.iuh.heathy_app_backend.controller;

import com.iuh.heathy_app_backend.dto.ChatRequest;
import com.iuh.heathy_app_backend.service.ChatAIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/support/chat")
public class SupportChatController {

    private final ChatAIService chatAIService;

    public SupportChatController(ChatAIService chatAIService) {
        this.chatAIService = chatAIService;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@RequestBody ChatRequest chatRequest) {
        String response = chatAIService.processMessage(chatRequest.getMessage(), chatRequest.getUserId());
        return ResponseEntity.ok(Map.of("response", response));
    }
}

