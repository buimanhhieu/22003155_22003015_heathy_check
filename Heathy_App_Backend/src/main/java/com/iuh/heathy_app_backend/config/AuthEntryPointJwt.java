package com.iuh.heathy_app_backend.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

    private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
            throws IOException {
        String uri = request.getRequestURI();
        String method = request.getMethod();
        
        // Chỉ log error cho các requests thực sự (không phải OPTIONS preflight)
        if (!"OPTIONS".equals(method)) {
            logger.warn("Unauthorized error for {} {}: {} - Remote: {}", 
                method, uri, authException.getMessage(), request.getRemoteAddr());
        } else {
            logger.debug("OPTIONS preflight request for {} - this is normal", uri);
        }
        
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error: Unauthorized");
    }
}