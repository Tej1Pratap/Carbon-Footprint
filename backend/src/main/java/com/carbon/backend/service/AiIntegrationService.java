package com.carbon.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiIntegrationService {

    @Value("${groq.api.key:${gemini.api.key:}}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

    public String generateResponse(String systemPrompt, String userMessage) {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("YOUR_GEMINI_API_KEY") || apiKey.equals("YOUR_GROQ_API_KEY")) {
            return "Hello! I am your AI Sustainability Assistant. (Note: Groq API key is not configured in application.properties, so I am running in offline mock mode). How can I help you reduce your carbon footprint today?";
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> systemMessage = new HashMap<>();
            systemMessage.put("role", "system");
            systemMessage.put("content", systemPrompt);

            Map<String, Object> uMessage = new HashMap<>();
            uMessage.put("role", "user");
            uMessage.put("content", userMessage);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.1-8b-instant");
            requestBody.put("messages", List.of(systemMessage, uMessage));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_API_URL, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    if (message != null) {
                        return (String) message.get("content");
                    }
                }
            }
            return "I apologize, but I am unable to process your request at the moment.";
        } catch (Exception e) {
            e.printStackTrace();
            return "I encountered an error while trying to connect to my AI brain. Please try again later.";
        }
    }
}
