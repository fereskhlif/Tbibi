package tn.esprit.pi.tbibi.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * GemmaService — delegates to the local Python Gemma microservice.
 *
 * The Python service (tbibi-gemma-service/main.py) runs locally on port 5000.
 * It loads Gemma via keras_nlp and uses In-Context Learning: it injects the
 * full medical knowledge base directly into the prompt before calling
 * gemma_lm.generate(). This ensures all answers are medically grounded.
 *
 * Flow:
 *   Angular -> AiChatController -> GemmaService -> Python (localhost:5000/ask)
 *                                                -> gemma_lm.generate(icl_prompt)
 *                                                -> answer returned
 */
@Slf4j
@Service
public class GemmaService {

    @Value("${gemma.service.url:http://localhost:5000}")
    private String gemmaServiceUrl;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GemmaService() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory =
                new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);      // 10s to connect
        factory.setReadTimeout(300_000);        // 5 min to read (CPU inference can be slow)
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Sends the patient question to the local Python Gemma service.
     * The Python service handles ICL (knowledge injection) and gemma_lm.generate().
     *
     * @param userQuestion the raw patient question
     * @return AI-generated medical guidance
     */
    public String askMedical(String userQuestion) {
        String endpoint = gemmaServiceUrl + "/ask";

        try {
            // ── Build request ──────────────────────────────────────────────
            Map<String, String> requestBody = Map.of("question", userQuestion);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

            log.info("[GemmaService] Sending question to Python service: {}...",
                    userQuestion.substring(0, Math.min(80, userQuestion.length())));

            // ── Call Python service ───────────────────────────────────────
            ResponseEntity<String> response = restTemplate.exchange(
                    endpoint,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            // ── Parse response ────────────────────────────────────────────
            JsonNode root = objectMapper.readTree(response.getBody());
            String answer = root.path("answer").asText();
            int latencyMs = root.path("latency_ms").asInt(0);

            log.info("[GemmaService] Answer received in {}ms ({} chars)", latencyMs, answer.length());
            return answer;

        } catch (ResourceAccessException e) {
            // Python service is not running or timed out
            String msg = e.getMessage() != null ? e.getMessage() : "";
            if (msg.contains("Read timed out")) {
                log.error("[GemmaService] Python service timed out (CPU inference too slow): {}", msg);
                return "⏳ The AI model is taking longer than expected to respond (running on CPU). " +
                       "Please try again with a shorter question, or wait a moment and retry.\n\n" +
                       "For urgent health concerns, please contact your doctor directly.";
            } else if (msg.contains("Connection reset")) {
                log.error("[GemmaService] Python service connection reset (possible OOM/crash): {}", msg);
                return "⚠️ The AI service crashed, likely due to insufficient memory. " +
                       "Please restart the Gemma Python service (tbibi-gemma-service/start.bat) and try again.";
            }
            log.error("[GemmaService] Python Gemma service not reachable at {}: {}", endpoint, e.getMessage());
            return "⚠️ The local AI service is currently unavailable. " +
                   "Please start the Gemma Python service (tbibi-gemma-service/start.bat) and try again.\n\n" +
                   "For urgent health concerns, please contact your doctor directly or call emergency services.";

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            // Python service returned an HTTP error (like 503 Service Unavailable)
            log.warn("[GemmaService] Python service returned HTTP {}", e.getStatusCode());
            try {
                // Try to parse the detail message from FastAPI {"detail": "..."}
                JsonNode errorNode = objectMapper.readTree(e.getResponseBodyAsString());
                if (errorNode.has("detail")) {
                    return "⏳ " + errorNode.path("detail").asText();
                }
            } catch (Exception parseEx) {
                log.warn("[GemmaService] Could not parse error body: {}", e.getResponseBodyAsString());
            }
            return "⚠️ The AI service is currently busy or loading. Please wait a moment and try again.";

        } catch (Exception e) {
            log.error("[GemmaService] Unexpected error: {}", e.getMessage(), e);
            return "⚠️ I encountered an unexpected error. Please try again in a moment.\n\n" +
                   "If this persists, please contact support or consult your healthcare provider directly.";
        }
    }

    /**
     * Checks if the Python Gemma service is healthy.
     * Called optionally by a health endpoint to verify the AI stack.
     */
    public boolean isHealthy() {
        try {
            ResponseEntity<String> resp = restTemplate.getForEntity(
                    gemmaServiceUrl + "/health", String.class);
            return resp.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            log.warn("[GemmaService] Health check failed: {}", e.getMessage());
            return false;
        }
    }
}
