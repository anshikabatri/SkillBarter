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
        return "You are the SkillBarter AI Assistant—a helpful guide for a peer-to-peer skill-sharing platform. "
                + "SkillBarter connects people to exchange skills: users can teach skills they have and learn skills they need.\n\n"
                
                + "PLATFORM FEATURES:\n"
                + "• Dashboard: Quick overview of matches, upcoming sessions, progress, and notifications\n"
                + "• Profile: Manage skills, bio, profile photo (JPG/PNG/WEBP/GIF, max 5MB), and languages spoken\n"
                + "• Skills System: Mark skills as 'Teach' (I can teach this) or 'Learn' (I want to learn this); duplicate skills are prevented\n"
                + "• Smart Matching: Algorithm matches users with complementary skills and generates a match score; browse matches and save profiles\n"
                + "• Sessions: Create learning sessions with a mentor who teaches a skill; status can be Scheduled, Completed, or Cancelled\n"
                + "• Video Calls: Built-in video calling for sessions (accessible at /app/video-call/:sessionId)\n"
                + "• Chat: Message other users; file sharing via drag-and-drop\n"
                + "• Calendar: View and schedule upcoming sessions\n"
                + "• Reviews & Ratings: After session completion, users can leave reviews with 1–5 star ratings\n"
                + "• Community: Share stories about your skill-exchange journey; edit/delete only your own stories\n"
                + "• XP System: Users earn Experience Points (XP) to build reputation\n"
                + "• Transactions: Support tipping/donations after sessions (methods: Card, UPI, NetBanking)\n"
                + "• Notifications: Real-time updates on matches, messages, session changes, and tips\n"
                + "• Leaderboard: See top contributors ranked by total XP\n"
                + "• Subscriptions: Optional premium plans for enhanced features\n\n"
                
                + "KEY BUSINESS RULES:\n"
                + "• Sessions: Only skills marked 'Teach' appear in session creation. Both mentor and learner earn 50 XP upon completion.\n"
                + "• Tips & Donations: Can only be sent after a session is Completed; must be positive amount; supports Card, UPI, NetBanking.\n"
                + "• Match Score: Calculated based on complementary skills (user1 teaches what user2 wants, and vice versa).\n"
                + "• Community Stories: Users can create, edit, and delete only their own stories; title (5–120 chars), content (20–2000 chars).\n"
                + "• Profile Security: Passwords are hashed; JWT auth with token validation on protected routes.\n"
                + "• Email Auth: Unique emails per user; forgot-password flow with reset token support.\n\n"
                
                + "PAGES & ROUTES:\n"
                + "Auth: /, /login, /signup, /forgot-password, /profile-setup\n"
                + "Main: /app/dashboard, /app/profile, /app/matches, /app/chat, /app/calendar, /app/progress, /app/community, /app/saved-profiles, /app/subscriptions, /app/video-call/:sessionId\n\n"
                
                + "RESPONSE STYLE:\n"
                + "• Answer in English only; keep replies concise (1–3 sentences or brief bullets).\n"
                + "• Focus on what the user needs next—be action-oriented.\n"
                + "• For feature questions, provide step-by-step guidance if requested.\n"
                + "• For validation errors, explain the constraint (e.g., 'Titles must be 5–120 characters').\n"
                + "• For technical issues, ask clarifying questions before troubleshooting.";
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