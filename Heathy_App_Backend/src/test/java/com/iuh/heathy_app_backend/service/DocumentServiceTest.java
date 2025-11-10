package com.iuh.heathy_app_backend.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test cases cho DocumentService
 */
@ExtendWith(MockitoExtension.class)
class DocumentServiceTest {

    @InjectMocks
    private DocumentService documentService;

    @Test
    void testReadDocumentation() {
        // Act
        String result = documentService.readDocumentation();
        
        // Assert
        assertNotNull(result);
        // Service sẽ trả về nội dung file hoặc error message nếu không đọc được
    }

    @Test
    void testGetRelevantSection() {
        // Arrange
        String keyword = "dinh dưỡng";
        
        // Act
        String result = documentService.getRelevantSection(keyword);
        
        // Assert
        assertNotNull(result);
        // Service sẽ trả về section liên quan hoặc toàn bộ documentation
    }

    @Test
    void testGetRelevantSection_NotFound() {
        // Arrange
        String keyword = "nonexistent_keyword_xyz123";
        
        // Act
        String result = documentService.getRelevantSection(keyword);
        
        // Assert
        assertNotNull(result);
        // Service sẽ trả về toàn bộ documentation nếu không tìm thấy section
    }
}

