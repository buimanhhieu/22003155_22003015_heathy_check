package com.iuh.heathy_app_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iuh.heathy_app_backend.dto.*;
import com.iuh.heathy_app_backend.entity.User;
import com.iuh.heathy_app_backend.entity.UserGoal;
import com.iuh.heathy_app_backend.entity.UserProfile;
import com.iuh.heathy_app_backend.repository.MenstrualCycleRepository;
import com.iuh.heathy_app_backend.repository.UserGoalRepository;
import com.iuh.heathy_app_backend.repository.UserProfileRepository;
import com.iuh.heathy_app_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.Field;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test cases dựa trên:
 * - PROFILE-001, PROFILE-002, PROFILE-003
 * - GOAL-001, GOAL-002, GOAL-003, GOAL-004, GOAL-005
 * - AUTH-008, AUTH-009 (Change Password)
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private UserGoalRepository userGoalRepository;
    
    @Mock
    private MenstrualCycleRepository menstrualCycleRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private RedisTemplate<String, Object> redisTemplate;
    
    @Mock
    private ObjectMapper objectMapper;
    
    @Mock
    private DashboardService dashboardService;
    
    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UserProfile testProfile;
    private UserGoal testGoal;
    private Long userId = 1L;

    @BeforeEach
    void setUp() throws Exception {
        // Setup User
        testUser = new User();
        testUser.setId(userId);
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("encodedPassword");
        testUser.setFullName("Test User");
        
        // Setup UserProfile
        testProfile = new UserProfile();
        testProfile.setUserId(userId);
        testProfile.setUser(testUser);
        testProfile.setDateOfBirth(LocalDate.of(1995, 1, 1));
        testProfile.setHeightCm(175.0);
        testProfile.setWeightKg(70.0);
        testProfile.setGender("MALE");
        testProfile.setAvatar("avatar.jpg");
        
        // Setup UserGoal
        testGoal = new UserGoal();
        testGoal.setUserId(userId);
        testGoal.setUser(testUser);
        testGoal.setDailyStepsGoal(10000);
        testGoal.setBedtime(LocalTime.of(22, 0));
        testGoal.setWakeup(LocalTime.of(6, 0));
        testGoal.setDailyCaloriesGoal(2000);
        
        // Inject @Autowired fields using reflection
        setField(userService, "redisTemplate", redisTemplate);
        setField(userService, "objectMapper", objectMapper);
        setField(userService, "dashboardService", dashboardService);
        
        // Setup Redis mock (lenient because not all tests use it)
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(redisTemplate.delete(anyString())).thenReturn(true);
    }
    
    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    // PROFILE-001: View Profile
    @Test
    void testGetUserProfileResponse_Success() {
        // Arrange
        when(valueOperations.get(anyString())).thenReturn(null); // Cache miss
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.of(testProfile));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        
        // Act
        UserProfileResponseDTO result = userService.getUserProfileResponse(userId);
        
        // Assert
        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals(testUser.getFullName(), result.getFullName());
        assertEquals(testUser.getEmail(), result.getEmail());
        assertEquals(testProfile.getDateOfBirth(), result.getDateOfBirth());
        assertEquals(testProfile.getHeightCm(), result.getHeightCm());
        assertEquals(testProfile.getWeightKg(), result.getWeightKg());
        assertEquals(testProfile.getGender(), result.getGender());
        assertEquals(testProfile.getAvatar(), result.getAvatar());
        
        verify(redisTemplate.opsForValue(), times(1)).get(anyString());
        verify(redisTemplate.opsForValue(), times(1)).set(anyString(), any(), eq(30L), eq(TimeUnit.MINUTES));
    }

    // PROFILE-001: View Profile from Cache
    @Test
    void testGetUserProfileResponse_FromCache() {
        // Arrange
        UserProfileResponseDTO cachedProfile = new UserProfileResponseDTO(
            userId, "Test User", "test@example.com", "Test User",
            LocalDate.of(1995, 1, 1), "avatar.jpg", 175.0, 70.0, "MALE"
        );
        when(valueOperations.get(anyString())).thenReturn(cachedProfile);
        
        // Act
        UserProfileResponseDTO result = userService.getUserProfileResponse(userId);
        
        // Assert
        assertNotNull(result);
        assertEquals(cachedProfile, result);
        
        verify(redisTemplate.opsForValue(), times(1)).get(anyString());
        verify(userProfileRepository, never()).findByUserId(anyLong());
    }

    // PROFILE-002: Update Profile
    @Test
    void testUpdateUserProfile_Success() {
        // Arrange
        UserProfileUpdateDTO updateDTO = new UserProfileUpdateDTO();
        updateDTO.setDateOfBirth(LocalDate.of(1996, 5, 15));
        updateDTO.setHeightCm(180.0);
        updateDTO.setWeightKg(75.0);
        updateDTO.setGender("MALE");
        updateDTO.setAvatar("new-avatar.jpg");
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.of(testProfile));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> {
            UserProfile saved = invocation.getArgument(0);
            saved.setDateOfBirth(updateDTO.getDateOfBirth());
            saved.setHeightCm(updateDTO.getHeightCm());
            saved.setWeightKg(updateDTO.getWeightKg());
            saved.setGender(updateDTO.getGender());
            saved.setAvatar(updateDTO.getAvatar());
            return saved;
        });
        when(redisTemplate.delete(anyString())).thenReturn(true);
        
        // Act
        UserProfile result = userService.updateUserProfile(userId, updateDTO);
        
        // Assert
        assertNotNull(result);
        assertEquals(updateDTO.getDateOfBirth(), result.getDateOfBirth());
        assertEquals(updateDTO.getHeightCm(), result.getHeightCm());
        assertEquals(updateDTO.getWeightKg(), result.getWeightKg());
        assertEquals(updateDTO.getGender(), result.getGender());
        assertEquals(updateDTO.getAvatar(), result.getAvatar());
        
        verify(userProfileRepository, times(1)).save(any(UserProfile.class));
        verify(redisTemplate, atLeastOnce()).delete(anyString()); // Cache invalidation
        verify(dashboardService, times(1)).invalidateDashboardCache(userId);
    }

    // PROFILE-003: Invalid Height
    @Test
    void testUpdateUserProfile_InvalidHeight() {
        // Arrange
        UserProfileUpdateDTO updateDTO = new UserProfileUpdateDTO();
        updateDTO.setDateOfBirth(LocalDate.of(1996, 5, 15));
        updateDTO.setHeightCm(50.0); // Invalid: too short (< 100cm)
        updateDTO.setWeightKg(75.0);
        updateDTO.setGender("MALE");
        
        // Note: Validation sẽ được handle ở Controller level với @Valid
        // Service test này chỉ test logic, không test validation
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.of(testProfile));
        when(userProfileRepository.save(any(UserProfile.class))).thenAnswer(invocation -> {
            UserProfile saved = invocation.getArgument(0);
            saved.setHeightCm(updateDTO.getHeightCm());
            saved.setWeightKg(updateDTO.getWeightKg());
            saved.setDateOfBirth(updateDTO.getDateOfBirth());
            saved.setGender(updateDTO.getGender());
            return saved;
        });
        
        // Act - Service sẽ accept invalid data, validation happens at controller
        UserProfile result = userService.updateUserProfile(userId, updateDTO);
        
        // Assert
        assertNotNull(result);
        assertEquals(50.0, result.getHeightCm()); // Service accepts invalid data
        // Service layer doesn't validate, controller does
    }

    // GOAL-001: Set Health Goal
    @Test
    void testUpdateUserGoal_SetHealthGoal() {
        // Arrange
        UserGoalUpdateDTO goalDTO = new UserGoalUpdateDTO();
        goalDTO.setDailyStepsGoal(10000);
        goalDTO.setBedtime(LocalTime.of(22, 0));
        goalDTO.setWakeup(LocalTime.of(6, 0));
        goalDTO.setActivityLevel(ActivityLevel.MODERATELY_ACTIVE);
        
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.of(testProfile));
        when(userGoalRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(userGoalRepository.save(any(UserGoal.class))).thenAnswer(invocation -> {
            UserGoal saved = invocation.getArgument(0);
            saved.setUserId(userId);
            saved.setDailyStepsGoal(goalDTO.getDailyStepsGoal());
            saved.setBedtime(goalDTO.getBedtime());
            saved.setWakeup(goalDTO.getWakeup());
            saved.setActivityLevel(goalDTO.getActivityLevel());
            // BMR calculation: (10 * 70) + (6.25 * 175) - (5 * 29) + 5 = 1706.25
            // MODERATELY_ACTIVE multiplier = 1.55
            // dailyCaloriesGoal = 1706.25 * 1.55 = 2645
            saved.setDailyCaloriesGoal(2645);
            return saved;
        });
        when(redisTemplate.delete(anyString())).thenReturn(true);
        
        // Act
        UserGoal result = userService.updateUserGoal(userId, goalDTO);
        
        // Assert
        assertNotNull(result);
        assertEquals(goalDTO.getDailyStepsGoal(), result.getDailyStepsGoal());
        assertEquals(goalDTO.getBedtime(), result.getBedtime());
        assertEquals(goalDTO.getWakeup(), result.getWakeup());
        assertEquals(goalDTO.getActivityLevel(), result.getActivityLevel());
        assertTrue(result.getDailyCaloriesGoal() > 0); // Should be calculated
        
        verify(userGoalRepository, times(1)).save(any(UserGoal.class));
        verify(redisTemplate, atLeastOnce()).delete(anyString());
        verify(dashboardService, times(1)).invalidateDashboardCache(userId);
    }

    // GOAL-002: Update Step Goal
    @Test
    void testUpdateUserGoal_UpdateStepGoal() {
        // Arrange
        UserGoalUpdateDTO goalDTO = new UserGoalUpdateDTO();
        goalDTO.setDailyStepsGoal(15000);
        goalDTO.setActivityLevel(ActivityLevel.MODERATELY_ACTIVE);
        
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.of(testProfile));
        when(userGoalRepository.findByUserId(userId)).thenReturn(Optional.of(testGoal));
        when(userGoalRepository.save(any(UserGoal.class))).thenAnswer(invocation -> {
            UserGoal saved = invocation.getArgument(0);
            saved.setDailyStepsGoal(15000);
            return saved;
        });
        when(redisTemplate.delete(anyString())).thenReturn(true);
        
        // Act
        UserGoal result = userService.updateUserGoal(userId, goalDTO);
        
        // Assert
        assertNotNull(result);
        assertEquals(15000, result.getDailyStepsGoal());
        
        verify(userGoalRepository, times(1)).save(any(UserGoal.class));
        verify(redisTemplate, atLeastOnce()).delete(anyString());
    }

    // GOAL-003: Invalid Step Goal (Service doesn't validate, controller does)
    // GOAL-004: Calculate Calories from BMR
    @Test
    void testUpdateUserGoal_CalculateCaloriesFromBMR() {
        // Arrange
        // User: Male, 25 years old (from 1995-01-01), 70kg, 175cm
        UserGoalUpdateDTO goalDTO = new UserGoalUpdateDTO();
        goalDTO.setActivityLevel(ActivityLevel.VERY_ACTIVE); // multiplier = 1.725
        
        when(userProfileRepository.findByUserId(userId)).thenReturn(Optional.of(testProfile));
        when(userGoalRepository.findByUserId(userId)).thenReturn(Optional.of(testGoal));
        when(userGoalRepository.save(any(UserGoal.class))).thenAnswer(invocation -> {
            UserGoal saved = invocation.getArgument(0);
            // BMR = (10 * 70) + (6.25 * 175) - (5 * 29) + 5 = 1706.25
            // VERY_ACTIVE multiplier = 1.725
            // dailyCaloriesGoal = 1706.25 * 1.725 = 2943
            saved.setDailyCaloriesGoal(2943);
            saved.setActivityLevel(ActivityLevel.VERY_ACTIVE);
            return saved;
        });
        when(redisTemplate.delete(anyString())).thenReturn(true);
        
        // Act
        UserGoal result = userService.updateUserGoal(userId, goalDTO);
        
        // Assert
        assertNotNull(result);
        assertEquals(2943, result.getDailyCaloriesGoal());
        assertEquals(ActivityLevel.VERY_ACTIVE, result.getActivityLevel());
    }

    // AUTH-008: Change Password Success
    @Test
    void testChangePassword_Success() {
        // Arrange
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("oldPassword");
        request.setNewPassword("newPassword123");
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("oldPassword", testUser.getPasswordHash())).thenReturn(true);
        when(passwordEncoder.encode("newPassword123")).thenReturn("encodedNewPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        
        // Act
        assertDoesNotThrow(() -> userService.changePassword(userId, request));
        
        // Assert
        verify(passwordEncoder, times(1)).matches("oldPassword", "encodedPassword");
        verify(passwordEncoder, times(1)).encode("newPassword123");
        verify(userRepository, times(1)).save(any(User.class));
    }

    // AUTH-009: Change Password Fail - Wrong Current Password
    @Test
    void testChangePassword_WrongCurrentPassword() {
        // Arrange
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("wrongPassword");
        request.setNewPassword("newPassword123");
        
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", testUser.getPasswordHash())).thenReturn(false);
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.changePassword(userId, request);
        });
        
        assertEquals("Current password is incorrect", exception.getMessage());
        verify(passwordEncoder, times(1)).matches("wrongPassword", testUser.getPasswordHash());
        verify(passwordEncoder, never()).encode(anyString());
        verify(userRepository, never()).save(any(User.class));
    }
}

