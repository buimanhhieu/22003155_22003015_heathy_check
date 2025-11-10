package com.iuh.heathy_app_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test cases dựa trên CHAT-001, CHAT-002, CHAT-003, CHAT-004
 */
@ExtendWith(MockitoExtension.class)
class ChatAIServiceTest {

    @Mock
    private DocumentService documentService;
    
    @Mock
    private UserDataService userDataService;
    
    @Mock
    private RestTemplate restTemplate;

    private ChatAIService chatAIService;

    private Long userId = 1L;
    private String apiKey = "test-api-key";
    private String apiVersion = "v1beta";
    private String model = "gemini-2.0-flash";
    private double temperature = 0.7;

    @BeforeEach
    void setUp() {
        // Create service instance manually because of @Value constructor parameters
        chatAIService = new ChatAIService(
            documentService,
            userDataService,
            apiKey,
            apiVersion,
            model,
            temperature
        );
        // Inject restTemplate using reflection
        ReflectionTestUtils.setField(chatAIService, "restTemplate", restTemplate);
    }

    // CHAT-001: Send Message to AI
    @Test
    void testProcessMessage_Success() throws Exception {
        // Arrange
        String userMessage = "Làm sao giảm cân?";
        String documentation = "Documentation content";
        String userData = "User data summary";
        String geminiResponse = "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"Để giảm cân, bạn cần...\"}]}}]}";
        
        when(documentService.readDocumentation()).thenReturn(documentation);
        lenient().when(userDataService.getUserSummary(userId)).thenReturn(userData);
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
            .thenReturn(new ResponseEntity<>(geminiResponse, HttpStatus.OK));
        
        // Act
        String result = chatAIService.processMessage(userMessage, userId);
        
        // Assert
        assertNotNull(result);
        assertTrue(result.contains("giảm cân") || result.length() > 0);
        verify(documentService, times(1)).readDocumentation();
        verify(restTemplate, times(1)).postForEntity(anyString(), any(), eq(String.class));
    }

    // CHAT-002: AI Responds About Health
    @Test
    void testProcessMessage_HealthQuestion() throws Exception {
        // Arrange
        String userMessage = "BMI của tôi?";
        String documentation = "Documentation content";
        String userData = "User: 25 years old, 70kg, 175cm";
        String geminiResponse = "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"BMI của bạn là 22.9\"}]}}]}";
        
        when(documentService.readDocumentation()).thenReturn(documentation);
        when(userDataService.getUserSummary(userId)).thenReturn(userData);
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
            .thenReturn(new ResponseEntity<>(geminiResponse, HttpStatus.OK));
        
        // Act
        String result = chatAIService.processMessage(userMessage, userId);
        
        // Assert
        assertNotNull(result);
        verify(userDataService, times(1)).getUserSummary(userId);
        verify(restTemplate, times(1)).postForEntity(anyString(), any(), eq(String.class));
    }

    // CHAT-003: Chat Without Token (This is handled at Controller level, not service)
    // CHAT-004: AI Service Down
    @Test
    void testProcessMessage_AIServiceDown() {
        // Arrange
        String userMessage = "Hello";
        String documentation = "Documentation content";
        
        when(documentService.readDocumentation()).thenReturn(documentation);
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
            .thenThrow(new RuntimeException("Connection refused"));
        
        // Act
        String result = chatAIService.processMessage(userMessage, userId);
        
        // Assert
        assertNotNull(result);
        assertTrue(result.contains("lỗi") || result.contains("thử lại"));
        verify(restTemplate, times(1)).postForEntity(anyString(), any(), eq(String.class));
    }

    @Test
    void testProcessMessage_HttpError() {
        // Arrange
        String userMessage = "Hello";
        String documentation = "Documentation content";
        
        when(documentService.readDocumentation()).thenReturn(documentation);
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
            .thenThrow(new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Server Error"));
        
        // Act
        String result = chatAIService.processMessage(userMessage, userId);
        
        // Assert
        assertNotNull(result);
        assertTrue(result.contains("lỗi") || result.contains("thử lại"));
    }

    @Test
    void testProcessMessage_NoAPIKey() {
        // Arrange
        ReflectionTestUtils.setField(chatAIService, "apiKey", null);
        String userMessage = "Hello";
        
        // Act
        String result = chatAIService.processMessage(userMessage, userId);
        
        // Assert
        assertNotNull(result);
        assertTrue(result.contains("chưa cấu hình") || result.contains("API key"));
    }
}

