package com.iuh.heathy_app_backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component; // ✅ Add this import
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component // ✅ Make this a Spring-managed component
public class AuthTokenFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    // ✅ Add the missing Logger definition
    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                // Using "email" for clarity as it's the identifier
                String email = jwtUtils.getUserNameFromJwtToken(jwt);
                logger.debug("Valid JWT token found for user: {}, URI: {}", email, request.getRequestURI());

                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else if (jwt != null) {
                logger.warn("JWT token is invalid or expired for request: {}", request.getRequestURI());
            } else {
                // Log khi không có token cho các endpoint yêu cầu authentication
                String uri = request.getRequestURI();
                if (!uri.startsWith("/api/auth/") && !uri.startsWith("/ws/")) {
                    logger.debug("No JWT token found in request header for URI: {}", uri);
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication for URI: {} - Error: {}", 
                request.getRequestURI(), e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}