package com.iuh.heathy_app_backend.service;

import com.iuh.heathy_app_backend.config.JwtUtils;
import com.iuh.heathy_app_backend.dto.AuthResponse;
import com.iuh.heathy_app_backend.dto.LoginRequest;
import com.iuh.heathy_app_backend.dto.MessageResponse;
import com.iuh.heathy_app_backend.dto.SignupRequest;
import com.iuh.heathy_app_backend.entity.User;
import com.iuh.heathy_app_backend.repository.MenstrualCycleRepository;
import com.iuh.heathy_app_backend.repository.UserProfileRepository;
import com.iuh.heathy_app_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Test cases dựa trên AUTH-001 đến AUTH-010
 */
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private UserProfileRepository userProfileRepository;
    
    @Mock
    private MenstrualCycleRepository menstrualCycleRepository;
    
    @Mock
    private PasswordEncoder passwordEncoder;
    
    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    private LoginRequest loginRequest;
    private SignupRequest signupRequest;
    private User testUser;
    private UserDetailsImpl userDetails;
    private Authentication authentication;

    @BeforeEach
    void setUp() {
        // Clear SecurityContext trước mỗi test
        SecurityContextHolder.clearContext();
        
        // Setup test data
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setPasswordHash("encodedPassword");
        testUser.setFullName("Test User");
        
        userDetails = UserDetailsImpl.build(testUser);
        
        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
        
        signupRequest = new SignupRequest();
        signupRequest.setEmail("newuser@example.com");
        signupRequest.setPassword("password123");
        signupRequest.setFullName("New User");
        
        authentication = mock(Authentication.class);
        // Use lenient() because this stubbing is only used in testAuthenticateUser_Success
        lenient().when(authentication.getPrincipal()).thenReturn(userDetails);
    }

    // AUTH-001: Successful Registration
    @Test
    void testRegisterUser_Success() {
        // Arrange
        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(signupRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(userProfileRepository.existsById(anyLong())).thenReturn(false);
        
        // Act
        MessageResponse response = authService.registerUser(signupRequest);
        
        // Assert
        assertNotNull(response);
        assertTrue(response.getMessage().contains("successfully"));
        assertEquals("User registered successfully!", response.getMessage());
        
        verify(userRepository, times(1)).existsByEmail(signupRequest.getEmail());
        verify(passwordEncoder, times(1)).encode(signupRequest.getPassword());
        verify(userRepository, times(1)).save(any(User.class));
    }

    // AUTH-002: Email Already Exists
    @Test
    void testRegisterUser_EmailAlreadyExists() {
        // Arrange
        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(true);
        
        // Act
        MessageResponse response = authService.registerUser(signupRequest);
        
        // Assert
        assertNotNull(response);
        assertTrue(response.getMessage().contains("already in use"));
        assertEquals("Error: Email is already in use!", response.getMessage());
        
        verify(userRepository, times(1)).existsByEmail(signupRequest.getEmail());
        verify(userRepository, never()).save(any(User.class));
    }

    // AUTH-003: Password Too Short (Validation sẽ được handle ở Controller level)
    // AUTH-004: Missing Required Field (Validation sẽ được handle ở Controller level)
    
    // AUTH-005: Successful Login
    @Test
    void testAuthenticateUser_Success() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("jwt-token-12345");
        
        // Act
        AuthResponse response = authService.authenticateUser(loginRequest);
        
        // Assert
        assertNotNull(response);
        assertEquals("jwt-token-12345", response.getToken());
        assertEquals(testUser.getId(), response.getId());
        assertEquals(testUser.getEmail(), response.getEmail());
        assertEquals(testUser.getFullName(), response.getName());
        
        // Verify SecurityContext was set
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils, times(1)).generateJwtToken(authentication);
    }

    // AUTH-006: Wrong Password
    @Test
    void testAuthenticateUser_WrongPassword() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new BadCredentialsException("Bad credentials"));
        
        // Act & Assert
        BadCredentialsException exception = assertThrows(BadCredentialsException.class, () -> {
            authService.authenticateUser(loginRequest);
        });
        
        assertEquals("Bad credentials", exception.getMessage());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils, never()).generateJwtToken(any());
    }

    // AUTH-007: Email Not Found
    @Test
    void testAuthenticateUser_EmailNotFound() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new BadCredentialsException("User not found"));
        
        // Act & Assert
        BadCredentialsException exception = assertThrows(BadCredentialsException.class, () -> {
            authService.authenticateUser(loginRequest);
        });
        
        assertEquals("User not found", exception.getMessage());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtUtils, never()).generateJwtToken(any());
    }
}

