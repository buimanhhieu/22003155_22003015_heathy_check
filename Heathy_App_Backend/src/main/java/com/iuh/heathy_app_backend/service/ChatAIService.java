package com.iuh.heathy_app_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class ChatAIService {

    private final DocumentService documentService;
    private final UserDataService userDataService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String apiKey;
    private final String apiVersion;
    private final String model;
    private final double temperature;

    public ChatAIService(DocumentService documentService,
                         UserDataService userDataService,
                         @Value("${app.gemini.api-key}") String apiKey,
                         @Value("${app.gemini.api-version:v1beta}") String apiVersion,
                         @Value("${app.gemini.model:gemini-pro}") String model,
                         @Value("${app.gemini.temperature:0.7}") double temperature) {
        this.documentService = documentService;
        this.userDataService = userDataService;
        this.apiKey = apiKey;
        this.apiVersion = apiVersion;
        this.model = model;
        this.temperature = temperature;
        this.restTemplate = new RestTemplate();

        this.restTemplate.getMessageConverters().stream()
                .filter(StringHttpMessageConverter.class::isInstance)
                .map(StringHttpMessageConverter.class::cast)
                .forEach(converter -> converter.setDefaultCharset(StandardCharsets.UTF_8));
    }

    /**
     * Xử lý câu hỏi từ người dùng và trả lời bằng Gemini API
     */
    public String processMessage(String userMessage, Long userId) {
        try {
            if (apiKey == null || apiKey.isBlank()) {
                return "Chưa cấu hình Gemini API key. Vui lòng liên hệ quản trị viên.";
            }

            // Đọc tài liệu hướng dẫn
            String documentation = documentService.readDocumentation();

            // Kiểm tra xem câu hỏi có liên quan đến dữ liệu cá nhân của người dùng hay không
            boolean needsUserData = checkIfNeedsUserData(userMessage);

            // Lấy dữ liệu người dùng nếu cần
            String userData = "";
            if (needsUserData) {
                userData = userDataService.getUserSummary(userId);
            }

            // Xây dựng system prompt
            String systemPrompt = buildSystemPrompt(documentation, userData, needsUserData);

            // Gọi Gemini
            String rawResponse = callGemini(systemPrompt, userMessage);
            return parseGeminiResponse(rawResponse);
        } catch (Exception e) {
            log.error("Error processing chat message", e);
            return "Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau hoặc hỏi lại bằng cách khác.";
        }
    }

    private String callGemini(String systemPrompt, String userMessage) {
        String url = "https://generativelanguage.googleapis.com/%s/models/%s:generateContent?key=%s"
                .formatted(apiVersion, model, apiKey);
        
        log.info("Calling Gemini API - URL: https://generativelanguage.googleapis.com/{}/models/{}:generateContent", apiVersion, model);
        log.debug("API Version: {}, Model: {}, Temperature: {}", apiVersion, model, temperature);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", "application/json");

        Map<String, Object> requestBody = new HashMap<>();
        
        // For v1beta API, we can use systemInstruction
        if ("v1beta".equals(apiVersion)) {
            // System instruction (system prompt) - supported in v1beta
            Map<String, Object> systemInstruction = new HashMap<>();
            systemInstruction.put("parts", List.of(Map.of("text", systemPrompt)));
            requestBody.put("systemInstruction", systemInstruction);
            
            // User message content
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> userContent = new HashMap<>();
            userContent.put("parts", List.of(Map.of("text", userMessage)));
            contents.add(userContent);
            requestBody.put("contents", contents);
        } else {
            // For v1 API, combine system prompt with user message
            String combinedMessage = systemPrompt + "\n\nNgười dùng hỏi: " + userMessage;
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> userContent = new HashMap<>();
            userContent.put("parts", List.of(Map.of("text", combinedMessage)));
            contents.add(userContent);
            requestBody.put("contents", contents);
        }
        
        // Generation config
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", temperature);
        requestBody.put("generationConfig", generationConfig);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        try {
            try {
                log.debug("Request body: {}", objectMapper.writeValueAsString(requestBody));
            } catch (Exception e) {
                log.debug("Could not serialize request body for logging", e);
            }
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            log.debug("Response status: {}, Body: {}", response.getStatusCode(), 
                    response.getBody() != null && response.getBody().length() > 500 
                    ? response.getBody().substring(0, 500) + "..." 
                    : response.getBody());
            return response.getBody();
        } catch (HttpClientErrorException e) {
            String body = e.getResponseBodyAsString();
            log.error("Gemini API error - Status: {}, URL: {}", e.getStatusCode(), url);
            log.error("Error response body: {}", body);
            try {
                JsonNode node = objectMapper.readTree(body);
                String errorMessage = node.path("error").path("message").asText();
                if (errorMessage != null && !errorMessage.isBlank()) {
                    log.error("Gemini API error message: {}", errorMessage);
                    throw new RuntimeException("Gemini API trả về lỗi: " + errorMessage, e);
                }
            } catch (Exception parseException) {
                log.error("Failed to parse Gemini error response", parseException);
                // ignore parse error, fall back to default message
            }
            throw new RuntimeException("Gemini API trả về lỗi HTTP " + e.getStatusCode(), e);
        } catch (Exception e) {
            log.error("Unexpected error calling Gemini API", e);
            throw new RuntimeException("Lỗi không mong đợi khi gọi Gemini API: " + e.getMessage(), e);
        }
    }

    private String parseGeminiResponse(String rawResponse) throws Exception {
        if (rawResponse == null || rawResponse.isBlank()) {
            return "Không nhận được phản hồi từ Gemini API.";
        }

        JsonNode root = objectMapper.readTree(rawResponse);
        JsonNode candidates = root.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            return "Không nhận được phản hồi từ Gemini API.";
        }

        JsonNode firstCandidate = candidates.get(0);
        JsonNode parts = firstCandidate.path("content").path("parts");
        if (!parts.isArray() || parts.isEmpty()) {
            return "Không nhận được phản hồi từ Gemini API.";
        }

        String text = parts.get(0).path("text").asText();
        return text != null && !text.isBlank()
                ? text.trim()
                : "Không nhận được phản hồi từ Gemini API.";
    }

    private boolean checkIfNeedsUserData(String userMessage) {
        String lowerMessage = userMessage.toLowerCase();
        String[] personalDataKeywords = {
            "của tôi", "tôi", "mình", "em", "bản thân",
            "dữ liệu", "thông tin", "hồ sơ", "mục tiêu",
            "bước chân", "calo", "cân nặng", "chiều cao",
            "bmi", "nhịp tim", "huyết áp", "giấc ngủ",
            "bữa ăn", "dinh dưỡng", "chu kỳ", "kinh nguyệt",
            "tiến độ", "kết quả", "thống kê", "biểu đồ",
            "hôm nay", "tuần này", "tháng này"
        };

        for (String keyword : personalDataKeywords) {
            if (lowerMessage.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String buildSystemPrompt(String documentation, String userData, boolean hasUserData) {
        String userDataSection;
        if (hasUserData && userData != null && !userData.isEmpty() && !userData.contains("Không tìm thấy")) {
            userDataSection = """
                
                DỮ LIỆU CỦA NGƯỜI DÙNG HIỆN TẠI:
                %s
                
                LƯU Ý: Khi trả lời câu hỏi về dữ liệu cá nhân, hãy sử dụng thông tin từ phần này.
                Nếu dữ liệu chưa đầy đủ hoặc người dùng chưa nhập, hãy nhắc nhở họ cập nhật dữ liệu.
                """.formatted(userData);
        } else {
            userDataSection = "\nLƯU Ý: Câu hỏi này không cần dữ liệu cá nhân. Trả lời dựa trên tài liệu hướng dẫn chung.";
        }

        return """
            Bạn là một trợ lý AI thông minh và thân thiện cho ứng dụng Healthy Check - một ứng dụng theo dõi sức khỏe toàn diện.
            
            NHIỆM VỤ CỦA BẠN:
            1. Trả lời câu hỏi về cách sử dụng ứng dụng dựa trên tài liệu được cung cấp
            2. Tư vấn về sức khỏe và lối sống lành mạnh
            3. Giải thích các tính năng và hướng dẫn sử dụng chi tiết
            4. Đưa ra lời khuyên hữu ích về sức khỏe, dinh dưỡng, tập thể dục, giấc ngủ
            5. Giải thích các chỉ số sức khỏe (BMI, nhịp tim, huyết áp, calo, v.v.)
            6. Trả lời câu hỏi về dữ liệu cá nhân của người dùng (nếu có)
            
            TÀI LIỆU HƯỚNG DẪN ỨNG DỤNG (ĐẦY ĐỦ VÀ CHI TIẾT):
            %s
            %s
            
            QUY TẮC TRẢ LỜI:
            1. Luôn trả lời bằng tiếng Việt
            2. Thân thiện, nhiệt tình và dễ hiểu
            3. Sử dụng thông tin từ tài liệu để trả lời chính xác
            4. Nếu câu hỏi về dữ liệu cá nhân (bước chân, calo, cân nặng, v.v.), sử dụng dữ liệu được cung cấp
            5. Nếu dữ liệu chưa có hoặc chưa đầy đủ, hướng dẫn người dùng cách nhập dữ liệu
            6. Đưa ra lời khuyên cụ thể và thực tế
            7. Không đưa ra chẩn đoán y tế, chỉ tư vấn chung
            8. Nếu câu hỏi về bệnh lý nghiêm trọng, đề xuất tham khảo ý kiến bác sĩ
            9. Giữ câu trả lời ngắn gọn nhưng đầy đủ thông tin (2-5 câu)
            10. Sử dụng emoji phù hợp để làm cho câu trả lời thân thiện hơn (tùy chọn)
            
            CÁC CHỦ ĐỀ BẠN CÓ THỂ TRẢ LỜI:
            - Cách sử dụng các tính năng của ứng dụng
            - Hướng dẫn đăng ký, đăng nhập, thiết lập hồ sơ
            - Cách theo dõi bước chân, calo, giấc ngủ, cân nặng
            - Mẹo sức khỏe và lối sống lành mạnh
            - Giải thích các chỉ số sức khỏe (BMI, nhịp tim, huyết áp)
            - Tư vấn dinh dưỡng và tập thể dục
            - Câu hỏi về dữ liệu cá nhân của người dùng
            - FAQ và troubleshooting
            
            Hãy trả lời câu hỏi của người dùng một cách hữu ích, chính xác và thân thiện nhất có thể.
            """.formatted(documentation, userDataSection);
    }
}

