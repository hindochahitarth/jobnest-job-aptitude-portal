package org.miniproject.jobnestjobaptitudeportal.config;

import java.util.List;

import org.miniproject.jobnestjobaptitudeportal.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
// Tells Spring that this class contains security configuration.
@EnableMethodSecurity
// Enables security annotations such as @PreAuthorize and @Secured
// on controller/service methods.
public class SecurityConfig {

    // Custom JWT filter used to check and authenticate users
    // using the JWT token sent with the request.
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // Constructor injection of the JWT authentication filter.
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // Defines the main Spring Security filter chain.
    // This method controls how incoming HTTP requests are secured.
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        return http

                // Disable CSRF because this application uses JWT authentication
                // and is designed as a stateless REST API.
                .csrf(csrf -> csrf.disable())

                // Enable CORS and use our custom CORS configuration.
                // CORS controls which frontend applications can communicate
                // with this backend.
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Make the application stateless.
                // The server will not create or maintain HTTP sessions.
                // Authentication is handled using JWT tokens instead.
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Define authorization rules for different API endpoints.
                .authorizeHttpRequests(auth -> auth

                        // Authentication endpoints such as login and registration
                        // can be accessed without authentication.
                        .requestMatchers("/api/auth/**").permitAll()

                        // Job-related endpoints are publicly accessible.
                        .requestMatchers("/api/jobs/**").permitAll()

                        // Uploaded files can be accessed without authentication.
                        .requestMatchers("/uploads/**").permitAll()

                        // Candidate-specific APIs can only be accessed
                        // by users having the CANDIDATE role.
                        .requestMatchers("/api/candidate/**").hasRole("CANDIDATE")

                        // Recruiter-specific APIs can only be accessed
                        // by users having the RECRUITER role.
                        .requestMatchers("/api/recruiter/**").hasRole("RECRUITER")

                        // Any other request is allowed without authentication.
                        .anyRequest().permitAll()
                )

                // Add the custom JWT filter before Spring Security's
                // UsernamePasswordAuthenticationFilter.
                //
                // This allows the application to read the JWT token,
                // validate it, and set the authenticated user before
                // Spring Security checks the user's permissions.
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )

                // Build and return the configured security filter chain.
                .build();
    }

    // Creates the PasswordEncoder used to securely hash passwords.
    @Bean
    PasswordEncoder passwordEncoder() {

        // BCrypt is a password-hashing algorithm designed for securely
        // storing user passwords.
        return new BCryptPasswordEncoder();
    }

    // Creates the configuration used for Cross-Origin Resource Sharing (CORS).
    @Bean
    CorsConfigurationSource corsConfigurationSource() {

        // Create a new CORS configuration object.
        CorsConfiguration configuration = new CorsConfiguration();

        // Allow requests coming from localhost or 127.0.0.1
        // using any port.
        //
        // Examples:
        // http://localhost:3000
        // http://localhost:5173
        // http://127.0.0.1:8080
        configuration.setAllowedOriginPatterns(
                List.of("http://localhost:*", "http://127.0.0.1:*")
        );

        // Allow these HTTP methods from the frontend.
        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        );

        // Allow the frontend to send these HTTP headers.
        //
        // Authorization is required for sending JWT tokens.
        // Content-Type is required for JSON and other request bodies.
        configuration.setAllowedHeaders(
                List.of("Authorization", "Content-Type")
        );

        // Allow credentials such as cookies or authentication-related
        // information to be included in cross-origin requests.
        configuration.setAllowCredentials(true);

        // Create a CORS configuration source that can apply
        // the configuration to different URL patterns.
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        // Apply the CORS configuration to all endpoints.
        source.registerCorsConfiguration("/**", configuration);

        // Return the CORS configuration source to Spring Security.
        return source;
    }
}