package org.miniproject.jobnestjobaptitudeportal.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

// @Component tells Spring to automatically create and manage
// an object (bean) of this filter.
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // JwtUtil is responsible for validating the JWT token
    // and extracting user information from it.
    private final JwtUtil jwtUtil;

    // Constructor injection is used to get JwtUtil from Spring.
    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    // This method is automatically executed for every HTTP request.
    // The filter checks whether the request contains a valid JWT token.
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // Get the value of the Authorization header from the request.
        //
        // Example:
        // Authorization: Bearer eyJhbGciOiJIUzI1Ni...
        String header = request.getHeader("Authorization");

        // Check whether the Authorization header exists
        // and starts with "Bearer ".
        //
        // "Bearer " indicates that the value after it is a JWT token.
        if (header != null && header.startsWith("Bearer ")) {

            // Remove "Bearer " from the beginning of the header
            // and keep only the actual JWT token.
            //
            // Example:
            // "Bearer abc123" -> "abc123"
            String token = header.substring(7);

            // Validate the JWT token using JwtUtil.
            //
            // validateToken() returns an Optional.
            // If the token is valid, jwtUser will contain
            // the user's information extracted from the token.
            jwtUtil.validateToken(token).ifPresent(jwtUser -> {

                // Create the user's authorities/roles.
                //
                // If the role is CANDIDATE:
                // "ROLE_" + "CANDIDATE"
                // becomes:
                // "ROLE_CANDIDATE"
                //
                // Spring Security uses this role when checking
                // .hasRole("CANDIDATE").
                List<SimpleGrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority(
                                "ROLE_" + jwtUser.role().name()
                        )
                );

                // Create an authentication object containing:
                //
                // 1. jwtUser  -> information about the logged-in user
                // 2. null     -> password/credentials are not needed here
                // 3. authorities -> user's roles/permissions
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                jwtUser,
                                null,
                                authorities
                        );

                // Store the authenticated user's information
                // inside Spring Security's SecurityContext.
                //
                // After this, Spring Security considers this request
                // to be authenticated and can check the user's role.
                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);
            });
        }

        // Continue the request and pass it to the next filter
        // or eventually to the controller.
        //
        // Without this line, the request would stop at this filter.
        filterChain.doFilter(request, response);
    }
}