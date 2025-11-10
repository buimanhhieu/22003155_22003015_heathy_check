package com.iuh.heathy_app_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iuh.heathy_app_backend.dto.DashboardDTO;
import com.iuh.heathy_app_backend.entity.*;
import com.iuh.heathy_app_backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.lang.reflect.Field;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test cases dựa trên Dashboard Testing
 */
@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private HealthDataEntryRepository healthDataEntryRepository;
    
    @Mock
    private MealLogRepository mealLogRepository;
    
    @Mock
    private MenstrualCycleRepository menstrualCycleRepository;
    
    @Mock
    private ArticleRepository articleRepository;
    
    @Mock
    private UserGoalRepository userGoalRepository;
    
    @Mock
    private RedisTemplate<String, Object> redisTemplate;
    
    @Mock
    private ObjectMapper objectMapper;
    
    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private DashboardService dashboardService;

    private Long userId = 1L;
    private UserGoal testGoal;
    private HealthDataEntry testStepsEntry;
    private MealLog testMealLog;

    @BeforeEach
    void setUp() throws Exception {
        testGoal = new UserGoal();
        testGoal.setUserId(userId);
        testGoal.setDailyStepsGoal(10000);
        testGoal.setDailyCaloriesGoal(2000);
        
        testStepsEntry = new HealthDataEntry();
        testStepsEntry.setId(1L);
        testStepsEntry.setMetricType(HealthMetricType.STEPS);
        testStepsEntry.setValue(5000.0);
        testStepsEntry.setUnit("steps");
        testStepsEntry.setRecordedAt(OffsetDateTime.now());
        
        testMealLog = new MealLog();
        testMealLog.setId(1L);
        testMealLog.setTotalCalories(500.0);
        testMealLog.setMealType(MealType.BREAKFAST);
        
        // Inject @Autowired fields using reflection
        setField(dashboardService, "redisTemplate", redisTemplate);
        setField(dashboardService, "objectMapper", objectMapper);
        
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }
    
    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    // Dashboard Test: Get Dashboard Data
    @Test
    void testGetDashboardData_Success() {
        // Arrange
        when(valueOperations.get(anyString())).thenReturn(null); // Cache miss
        when(userGoalRepository.findByUserId(userId)).thenReturn(Optional.of(testGoal));
        when(healthDataEntryRepository.findRecentDataForHealthScore(anyLong(), anyList(), any()))
            .thenReturn(Collections.emptyList());
        when(healthDataEntryRepository.findLatestTodayByUserAndMetric(anyLong(), any(), any(), any()))
            .thenReturn(Optional.of(testStepsEntry));
        when(healthDataEntryRepository.findLatestByUserAndMetricAndTimeRange(anyLong(), any(), any()))
            .thenReturn(Optional.empty());
        when(healthDataEntryRepository.findWeeklyTotalsByUserAndMetrics(anyLong(), any(), anyList()))
            .thenReturn(Collections.emptyList());
        when(mealLogRepository.findByUserIdAndDateRange(anyLong(), any(), any()))
            .thenReturn(Arrays.asList(testMealLog));
        when(mealLogRepository.findDailyCaloriesAndLastUpdate(anyLong(), any(), any()))
            .thenReturn(new Object[]{500.0, OffsetDateTime.now()});
        when(menstrualCycleRepository.findLatestByUser(userId)).thenReturn(Optional.empty());
        when(articleRepository.findTop2ByOrderByPublishedAtDesc()).thenReturn(Collections.emptyList());
        
        // Act
        DashboardDTO result = dashboardService.getDashboardData(userId);
        
        // Assert
        assertNotNull(result);
        assertNotNull(result.getHealthScore());
        assertNotNull(result.getHighlights());
        assertNotNull(result.getWeeklyReport());
        assertNotNull(result.getBlogs());
        
        verify(redisTemplate.opsForValue(), times(1)).set(anyString(), any(), eq(10L), any());
    }

    @Test
    void testGetDashboardData_FromCache() {
        // Arrange
        DashboardDTO cachedDashboard = new DashboardDTO();
        when(valueOperations.get(anyString())).thenReturn(cachedDashboard);
        
        // Act
        DashboardDTO result = dashboardService.getDashboardData(userId);
        
        // Assert
        assertNotNull(result);
        assertEquals(cachedDashboard, result);
        verify(healthDataEntryRepository, never()).findLatestTodayByUserAndMetric(anyLong(), any(), any(), any());
    }

    @Test
    void testInvalidateDashboardCache() {
        // Arrange
        when(redisTemplate.delete(anyString())).thenReturn(true);
        
        // Act
        assertDoesNotThrow(() -> dashboardService.invalidateDashboardCache(userId));
        
        // Assert
        verify(redisTemplate, times(1)).delete(anyString());
    }
}

