package com.iuh.heathy_app_backend.controller;

import com.iuh.heathy_app_backend.dto.AuthResponse;
import com.iuh.heathy_app_backend.dto.LoginRequest;
import com.iuh.heathy_app_backend.dto.SignupRequest;
import com.iuh.heathy_app_backend.dto.MessageResponse;
import com.iuh.heathy_app_backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/signup")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        // Ủy quyền toàn bộ logic đăng ký cho AuthService
        MessageResponse response = authService.registerUser(signUpRequest);
        // Kiểm tra xem có lỗi không để trả về badRequest hoặc ok
        if (response.getMessage().startsWith("Error:")) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }
}