package com.iuh.heathy_app_backend.service;

import com.iuh.heathy_app_backend.entity.*;
import com.iuh.heathy_app_backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test cases cho UserDataService
 */
@ExtendWith(MockitoExtension.class)
class UserDataServiceTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private UserProfileRepository userProfileRepository;
    
    @Mock
    private UserGoalRepository userGoalRepository;
    
    @Mock
    private HealthDataEntryRepository healthDataEntryRepository;
    
    @Mock
    private MealLogRepository mealLogRepository;
    
    @Mock
    private MenstrualCycleRepository menstrualCycleRepository;

    @InjectMocks
    private UserDataService userDataService;

    private User testUser;
    private UserProfile testProfile;
    private UserGoal testGoal;
    private Long userId = 1L;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(userId);
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");
        
        testProfile = new UserProfile();
        testProfile.setUserId(userId);
        testProfile.setDateOfBirth(LocalDate.of(1995, 1, 1));
        testProfile.setGender("MALE");
        testProfile.setHeightCm(175.0);
        testProfile.setWeightKg(70.0);
        
        testGoal = new UserGoal();
        testGoal.setUserId(userId);
        testGoal.setDailyStepsGoal(10000);
        testGoal.setDailyCaloriesGoal(2000);
    }

    @Test
    void testGetUserSummary_Success() {
        // Arrange
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(testProfile));
        when(userGoalRepository.findById(userId)).thenReturn(Optional.of(testGoal));
        when(healthDataEntryRepository.findRecentDataForHealthScore(anyLong(), anyList(), any()))
            .thenReturn(Collections.emptyList());
        when(mealLogRepository.findByUserIdAndDateRange(anyLong(), any(), any()))
            .thenReturn(Collections.emptyList());
        when(menstrualCycleRepository.findLatestByUser(userId)).thenReturn(Optional.empty());
        
        // Act
        String result = userDataService.getUserSummary(userId);
        
        // Assert
        assertNotNull(result);
        assertTrue(result.contains("THÔNG TIN NGƯỜI DÙNG"));
        assertTrue(result.contains(testUser.getEmail()));
        assertTrue(result.contains("HỒ SƠ"));
        assertTrue(result.contains("MỤC TIÊU"));
        
        verify(userRepository, times(1)).findById(userId);
        verify(userProfileRepository, times(1)).findById(userId);
        verify(userGoalRepository, times(1)).findById(userId);
    }

    @Test
    void testGetUserSummary_UserNotFound() {
        // Arrange
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        
        // Act
        String result = userDataService.getUserSummary(userId);
        
        // Assert
        assertNotNull(result);
        assertTrue(result.contains("Không tìm thấy"));
    }

    @Test
    void testGetUserSummary_WithHealthData() {
        // Arrange
        HealthDataEntry healthEntry = new HealthDataEntry();
        healthEntry.setMetricType(HealthMetricType.STEPS);
        healthEntry.setValue(5000.0);
        healthEntry.setUnit("steps");
        healthEntry.setRecordedAt(OffsetDateTime.now());
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(testProfile));
        when(userGoalRepository.findById(userId)).thenReturn(Optional.of(testGoal));
        when(healthDataEntryRepository.findRecentDataForHealthScore(anyLong(), anyList(), any()))
            .thenReturn(Arrays.asList(healthEntry));
        when(mealLogRepository.findByUserIdAndDateRange(anyLong(), any(), any()))
            .thenReturn(Collections.emptyList());
        when(menstrualCycleRepository.findLatestByUser(userId)).thenReturn(Optional.empty());
        
        // Act
        String result = userDataService.getUserSummary(userId);
        
        // Assert
        assertNotNull(result);
        assertTrue(result.contains("DỮ LIỆU SỨC KHỎE"));
    }
}

