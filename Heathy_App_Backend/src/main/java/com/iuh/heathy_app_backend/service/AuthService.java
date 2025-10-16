package com.iuh.heathy_app_backend.service;

import com.iuh.heathy_app_backend.dto.AuthResponse;
import com.iuh.heathy_app_backend.dto.LoginRequest;
import com.iuh.heathy_app_backend.dto.SignupRequest;
import com.iuh.heathy_app_backend.dto.MessageResponse;
import com.iuh.heathy_app_backend.entity.User;
import com.iuh.heathy_app_backend.repository.UserRepository;
import com.iuh.heathy_app_backend.config.JwtUtils; // Giả sử bạn có lớp này
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    // Constructor Injection
    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        return new AuthResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getFullName());
    }
    public MessageResponse registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return new MessageResponse("Error: Email is already in use!");
        }
        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setPasswordHash(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setFullName(signUpRequest.getFullName());
        user.setProvider("local"); // Đặt provider mặc định

        userRepository.save(user);

        return new MessageResponse("User registered successfully!");
    }
}