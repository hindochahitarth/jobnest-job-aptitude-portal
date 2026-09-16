package org.miniproject.jobnestjobaptitudeportal.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Thin client that calls the Groq Chat Completions API.
 * Uses Java's built-in java.net.http.HttpClient — no extra dependencies needed.
 */
@Component
public class GroqApiClient {

    private static final Logger log = LoggerFactory.getLogger(GroqApiClient.class);

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String apiUrl;

    @Value("${groq.api.model:llama-3.3-70b-versatile}")
    private String model;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Sends a single-user prompt to Groq and returns the assistant's text reply.
     * Returns null if the call fails so callers can fall back to local templates.
     */
    public String chat(String systemPrompt, String userMessage) {
        try {
            ObjectNode body = mapper.createObjectNode();
            body.put("model", model);
            body.put("temperature", 1.0);          // higher = more random
            body.put("max_tokens", 2048);

            ArrayNode messages = body.putArray("messages");

            if (systemPrompt != null && !systemPrompt.isBlank()) {
                ObjectNode sys = mapper.createObjectNode();
                sys.put("role", "system");
                sys.put("content", systemPrompt);
                messages.add(sys);
            }

            ObjectNode user = mapper.createObjectNode();
            user.put("role", "user");
            user.put("content", userMessage);
            messages.add(user);

            String requestBody = mapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .timeout(Duration.ofSeconds(30))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warn("Groq API returned HTTP {}: {}", response.statusCode(), response.body());
                return null;
            }

            JsonNode root = mapper.readTree(response.body());
            return root.path("choices").path(0).path("message").path("content").asText(null);

        } catch (Exception ex) {
            log.error("Groq API call failed: {}", ex.getMessage());
            return null;
        }
    }

    /**
     * Convenience: chat with only a user message (no system prompt).
     */
    public String chat(String userMessage) {
        return chat(null, userMessage);
    }
}
