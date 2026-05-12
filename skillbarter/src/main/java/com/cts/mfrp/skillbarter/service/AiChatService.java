package com.cts.mfrp.skillbarter.service;

import com.cts.mfrp.skillbarter.dto.ai.AiChatRequest;
import com.cts.mfrp.skillbarter.dto.ai.AiChatResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiChatService {

    private static final String FALLBACK_RESPONSE = "Sorry, I could not generate a response. Please try again.";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash-lite}")
    private String model;

    public AiChatService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = createRestTemplate();
    }

    public AiChatResponse chat(AiChatRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            return new AiChatResponse(false, "AI is not configured on the server.");
        }

        String userMessage = request.getUserMessage() == null ? "" : request.getUserMessage().trim();
        if (userMessage.isBlank()) {
            return new AiChatResponse(false, "Please enter a question.");
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", buildContents(request));
        requestBody.put("systemInstruction", Map.of("parts", List.of(Map.of("text", buildSystemPrompt()))));
        requestBody.put("generationConfig", Map.of(
                "temperature", 0.4,
                "topK", 20,
                "topP", 0.9,
                "maxOutputTokens", 256
        ));
        requestBody.put("safetySettings", List.of(
                Map.of("category", "HARM_CATEGORY_HATE_SPEECH", "threshold", "BLOCK_ONLY_HIGH"),
                Map.of("category", "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold", "BLOCK_ONLY_HIGH"),
                Map.of("category", "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold", "BLOCK_ONLY_HIGH"),
                Map.of("category", "HARM_CATEGORY_HARASSMENT", "threshold", "BLOCK_ONLY_HIGH"),
                Map.of("category", "HARM_CATEGORY_CIVIC_INTEGRITY", "threshold", "BLOCK_ONLY_HIGH")
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            ResponseEntity<JsonNode> response = restTemplate.exchange(
                buildApiUrl(),
                HttpMethod.POST,
                new HttpEntity<>(requestBody, headers),
                JsonNode.class
            );

            String text = response.getBody() == null
                    ? ""
                    : response.getBody().path("candidates").path(0).path("content").path("parts").path(0).path("text").asText("");

            if (text.isBlank()) {
                return new AiChatResponse(false, FALLBACK_RESPONSE);
            }

            return new AiChatResponse(true, text.trim());
        } catch (HttpStatusCodeException ex) {
            return new AiChatResponse(false, "Sorry, I encountered an error: " + extractErrorMessage(ex.getResponseBodyAsString()));
        } catch (Exception ex) {
            return new AiChatResponse(false, "Sorry, I encountered an error: " + ex.getMessage());
        }
    }

    private String buildApiUrl() {
        return "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;
    }

    private RestTemplate createRestTemplate() {
        var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(10).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(20).toMillis());
        return new RestTemplate(factory);
    }

    private List<Map<String, Object>> buildContents(AiChatRequest request) {
        List<Map<String, Object>> contents = new ArrayList<>();

        if (request.getConversationHistory() != null) {
            for (AiChatRequest.ChatMessage message : request.getConversationHistory()) {
                if (message == null || message.getRole() == null || message.getParts() == null || message.getParts().isEmpty()) {
                    continue;
                }

                List<Map<String, Object>> parts = new ArrayList<>();
                for (AiChatRequest.ChatPart part : message.getParts()) {
                    if (part != null && part.getText() != null && !part.getText().isBlank()) {
                        parts.add(Map.of("text", part.getText()));
                    }
                }

                if (!parts.isEmpty()) {
                    contents.add(Map.of("role", message.getRole(), "parts", parts));
                }
            }
        }

        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", request.getUserMessage()))
        ));

        return contents;
    }

    private String buildSystemPrompt() {
        return "You are SkillBarter Assistant for a skill-sharing app. "
                + "Answer in English only, keep replies concise, and prefer 1-3 short sentences or brief bullets. "
                + "Explain only what the user needs next. "
                + "SkillBarter includes mentors, learners, matches, sessions, XP, donations, reviews, community stories, notifications, calendar, chat, profile, subscriptions, and video calls. "
                + "Important facts: only skills marked Teach appear in session creation, both users get 50 XP when a session is completed, tips are only allowed after completion, and users can edit/delete their own community stories. "
                + "If the user asks for a walkthrough, keep it short and step-by-step.";
    }

    private String extractErrorMessage(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            String message = root.path("error").path("message").asText("");
            return message.isBlank() ? responseBody : message;
        } catch (Exception ex) {
            return responseBody == null || responseBody.isBlank() ? "Unknown Gemini API error" : responseBody;
        }
    }
}