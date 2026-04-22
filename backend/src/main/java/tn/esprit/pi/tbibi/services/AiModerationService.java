package tn.esprit.pi.tbibi.services;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Service
@Slf4j
public class AiModerationService {

    private final WebClient webClient = WebClient.builder()
            .baseUrl("http://localhost:8000")
            .build();

    // DTO for request
    @Data
    static class SanitizeRequest {
        private String text;
        public SanitizeRequest(String text) { this.text = text; }
    }

    // DTO for response
    @Data
    static class SanitizeResponse {
        private String original;
        private String cleaned;
        @JsonProperty("is_toxic")
        private boolean toxic;
        private double confidence;
    }

    /**
     * Sends text to Python AI service.
     * Returns the cleaned version (bad words hidden with ****)
     * If AI service is down, returns original text (fail safe)
     */
    public String sanitizeText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }
        try {
            SanitizeResponse response = webClient.post()
                    .uri("/sanitize")
                    .bodyValue(new SanitizeRequest(text))
                    .retrieve()
                    .bodyToMono(SanitizeResponse.class)
                    .block(); // synchronous call

            if (response != null) {
                return response.getCleaned(); // return cleaned text
            }
        } catch (Exception e) {
            // If AI service is down, don't crash — just save original
            log.warn("AI moderation service unavailable: {}", e.getMessage());
        }
        return text; // fallback: return original
    }
}