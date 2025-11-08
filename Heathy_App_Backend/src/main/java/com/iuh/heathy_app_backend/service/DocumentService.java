package com.iuh.heathy_app_backend.service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
public class DocumentService {
    
    private static final String DOCUMENT_PATH = "docs/app_guide.txt";
    
    /**
     * Đọc nội dung file documentation
     */
    public String readDocumentation() {
        try {
            ClassPathResource resource = new ClassPathResource(DOCUMENT_PATH);
            return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            return "Không thể đọc file tài liệu. Vui lòng thử lại sau.";
        }
    }
    
    /**
     * Lấy một phần của documentation dựa trên từ khóa
     */
    public String getRelevantSection(String keyword) {
        String fullDoc = readDocumentation();
        // Tìm phần liên quan đến keyword
        String lowerKeyword = keyword.toLowerCase();
        String[] sections = fullDoc.split("==========================================");
        
        for (String section : sections) {
            if (section.toLowerCase().contains(lowerKeyword)) {
                return section.trim();
            }
        }
        
        return fullDoc; // Trả về toàn bộ nếu không tìm thấy phần cụ thể
    }
}

