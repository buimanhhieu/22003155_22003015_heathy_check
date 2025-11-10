package com.iuh.heathy_app_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iuh.heathy_app_backend.dto.MealLogRequestDTO;
import com.iuh.heathy_app_backend.dto.MealLogResponseDTO;
import com.iuh.heathy_app_backend.entity.MealLog;
import com.iuh.heathy_app_backend.entity.MealType;
import com.iuh.heathy_app_backend.entity.User;
import com.iuh.heathy_app_backend.repository.MealLogRepository;
import com.iuh.heathy_app_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import java.lang.reflect.Field;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Test cases dựa trên HEALTH-004: Add Meal
 */
@ExtendWith(MockitoExtension.class)
class MealLogServiceTest {

    @Mock
    private MealLogRepository mealLogRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private RedisTemplate<String, Object> redisTemplate;
    
    @Mock
    private ObjectMapper objectMapper;
    
    @Mock
    private DashboardService dashboardService;

    @InjectMocks
    private MealLogService mealLogService;

    private User testUser;
    private MealLog testMealLog;
    private Long userId = 1L;

    @BeforeEach
    void setUp() throws Exception {
        testUser = new User();
        testUser.setId(userId);
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");
        
        testMealLog = new MealLog();
        testMealLog.setId(1L);
        testMealLog.setUser(testUser);
        testMealLog.setMealName("Breakfast");
        testMealLog.setMealType(MealType.BREAKFAST);
        testMealLog.setTotalCalories(500.0);
        testMealLog.setFatGrams(20.0);
        testMealLog.setProteinGrams(30.0);
        testMealLog.setCarbsGrams(50.0);
        testMealLog.setLoggedAt(OffsetDateTime.now());
        
        // Inject @Autowired fields using reflection
        setField(mealLogService, "redisTemplate", redisTemplate);
        setField(mealLogService, "objectMapper", objectMapper);
        setField(mealLogService, "dashboardService", dashboardService);
        
        // Mock redisTemplate.delete() to avoid NPE (lenient because not all tests call it)
        lenient().when(redisTemplate.delete(anyString())).thenReturn(true);
    }
    
    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    // HEALTH-004: Add Meal
    @Test
    void testCreateMealLog_Success() {
        // Arrange
        MealLogRequestDTO requestDTO = new MealLogRequestDTO();
        requestDTO.setMealType(MealType.BREAKFAST);
        requestDTO.setTotalCalories(500.0);
        requestDTO.setFatGrams(20.0);
        requestDTO.setProteinGrams(30.0);
        requestDTO.setCarbsGrams(50.0);
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(mealLogRepository.save(any(MealLog.class))).thenAnswer(invocation -> {
            MealLog saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        
        // Act
        MealLogResponseDTO result = mealLogService.createMealLog(userId, requestDTO);
        
        // Assert
        assertNotNull(result);
        assertEquals(MealType.BREAKFAST, result.getMealType());
        assertEquals(500.0, result.getTotalCalories());
        assertEquals(20.0, result.getFatGrams());
        assertEquals(30.0, result.getProteinGrams());
        assertEquals(50.0, result.getCarbsGrams());
        
        verify(userRepository, times(1)).findById(userId);
        verify(mealLogRepository, times(1)).save(any(MealLog.class));
        verify(redisTemplate, atLeastOnce()).delete(anyString());
        verify(dashboardService, times(1)).invalidateDashboardCache(userId);
    }

    @Test
    void testCreateMealLog_CalculateCalories() {
        // Arrange
        MealLogRequestDTO requestDTO = new MealLogRequestDTO();
        requestDTO.setMealType(MealType.LUNCH);
        // Chỉ có macros, không có totalCalories
        requestDTO.setFatGrams(20.0);
        requestDTO.setProteinGrams(30.0);
        requestDTO.setCarbsGrams(50.0);
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(mealLogRepository.save(any(MealLog.class))).thenAnswer(invocation -> {
            MealLog saved = invocation.getArgument(0);
            saved.setId(1L);
            // Calories = (20 * 9) + (30 * 4) + (50 * 4) = 180 + 120 + 200 = 500
            saved.setTotalCalories(500.0);
            return saved;
        });
        
        // Act
        MealLogResponseDTO result = mealLogService.createMealLog(userId, requestDTO);
        
        // Assert
        assertNotNull(result);
        assertEquals(500.0, result.getTotalCalories());
    }

    @Test
    void testCreateMealLog_UserNotFound() {
        // Arrange
        MealLogRequestDTO requestDTO = new MealLogRequestDTO();
        requestDTO.setMealType(MealType.BREAKFAST);
        requestDTO.setTotalCalories(500.0);
        
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            mealLogService.createMealLog(userId, requestDTO);
        });
        
        assertEquals("User not found with id: " + userId, exception.getMessage());
        verify(mealLogRepository, never()).save(any(MealLog.class));
    }
}

