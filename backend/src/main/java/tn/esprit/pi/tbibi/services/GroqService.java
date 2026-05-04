package tn.esprit.pi.tbibi.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineOcrResult;
import reactor.core.publisher.Flux;
import org.springframework.web.reactive.function.client.WebClient;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class GroqService {

    @Value("${groq.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;
    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GroqService() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(30000);
        this.restTemplate = new RestTemplate(factory);
        this.webClient = WebClient.builder().build();
    }

    public MedicineOcrResult extractMedicineInfo(String ocrText, MultipartFile imageFile) throws Exception {

        // Resize image and convert to base64
        BufferedImage original = ImageIO.read(imageFile.getInputStream());

        // Resize to max 800px width to reduce size
        int maxWidth = 800;
        int width = original.getWidth();
        int height = original.getHeight();
        if (width > maxWidth) {
            height = (int) ((double) height * maxWidth / width);
            width = maxWidth;
        }
        BufferedImage resized = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resized.createGraphics();
        g.drawImage(original, 0, 0, width, height, null);
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(resized, "jpg", baos);
        String base64Image = Base64.getEncoder().encodeToString(baos.toByteArray());

        String prompt = """
                You are a pharmacy assistant with medical knowledge.
                Look at this medicine box image carefully.
                Also use this OCR text as a hint (may be incomplete):
                """ + ocrText
                + """

                        Extract the medicine information and return ONLY a valid JSON:
                        {
                          "medicineName": "",
                          "dosage": "",
                          "description": "",
                          "form": "",
                          "activeIngredient": "",
                          "category": ""
                        }

                        For form use ONLY: TABLET, CAPSULE, SYRUP, INJECTION, CREAM,
                        OINTMENT, SUPPOSITORY, EYE_DROPS, SPRAY, PATCH, SACHET, POWDER, OTHER

                        For category use ONLY: COUGH_AND_COLD, RESPIRATORY, FEVER_AND_PAIN, MUSCLE_AND_JOINT, ANTIBIOTIC, ANTIVIRAL, ANTIFUNGAL, DIGESTIVE, SKIN, WOUND_CARE, ALLERGY, EYE_AND_EAR, DIABETES, HYPERTENSION, CARDIAC, THYROID, ANXIETY_AND_SLEEP, URINARY, VITAMINS_AND_SUPPLEMENTS, ORAL_AND_DENTAL, OTHER

                        Rules:
                        - medicineName: the main brand name (e.g. Gripex, Panadol)
                        - dosage: Look for strength (e.g. 500mg, 1000mg). For sachets, look for grams per sachet.
                        - description: Extract use cases (e.g. Rhume, Etat grippal).
                        - form: Choose the best match from the list.
                        - activeIngredient: Look for "Composition" or the generic name (e.g. Paracetamol). If multiple, list them separated by comma.
                        - category: Choose the best matching therapeutic category.

                        Note: If the image is blurry, use your knowledge of common medications to fill missing fields.
                        Return ONLY valid JSON.
                        """;

        Map<String, Object> textContent = Map.of("type", "text", "text", prompt);
        Map<String, Object> imageContent = Map.of(
                "type", "image_url",
                "image_url", Map.of("url", "data:image/jpeg;base64," + base64Image));

        Map<String, Object> requestBody = Map.of(
                "model", "meta-llama/llama-4-scout-17b-16e-instruct",
                "max_tokens", 500,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "user", "content", List.of(textContent, imageContent))));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                "https://api.groq.com/openai/v1/chat/completions",
                HttpMethod.POST,
                entity,
                String.class);

        System.out.println("=== GROQ RAW RESPONSE ===");
        System.out.println(response.getBody());
        System.out.println("=========================");

        JsonNode root = objectMapper.readTree(response.getBody());
        String content = root.path("choices").get(0)
                .path("message").path("content").asText();

        content = content.trim();
        if (content.startsWith("```")) {
            content = content.replaceAll("```json", "").replaceAll("```", "").trim();
        }

        MedicineOcrResult result = objectMapper.readValue(content, MedicineOcrResult.class);
        System.out.println("Parsed result: Name=" + result.getMedicineName() + ", Form=" + result.getForm());
        return result;
    }

    // Keep old method
    public MedicineOcrResult extractMedicineInfo(String rawText) throws Exception {
        return extractMedicineInfo(rawText, null);
    }

    /**
     * Generic method for chat completions (used for summarization, etc.)
     */
    public String generateChatCompletion(String systemPrompt, String userPrompt) throws Exception {
        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "max_tokens", 1000,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                "https://api.groq.com/openai/v1/chat/completions",
                HttpMethod.POST,
                entity,
                String.class);

        JsonNode root = objectMapper.readTree(response.getBody());
        return root.path("choices").get(0)
                .path("message").path("content").asText();
    }

    /**
     * Streams chat completions for real-time UI updates
     */
    public Flux<String> streamChatCompletion(String systemPrompt, String userPrompt) {
        if (apiKey == null || apiKey.isEmpty()) {
            System.err.println("Groq Error: API Key is MISSING! Check your application.properties");
            return Flux.error(new RuntimeException("API Key missing"));
        }
        System.out.println(
                "Groq Debug: Using API Key starting with: " + (apiKey.length() > 5 ? apiKey.substring(0, 4) : "****"));

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile", // Use the latest versatile model
                "max_tokens", 1000,
                "stream", true,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)));

        return webClient.post()
                .uri("https://api.groq.com/openai/v1/chat/completions")
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .header(HttpHeaders.ACCEPT, MediaType.TEXT_EVENT_STREAM_VALUE)
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.isError(), response -> {
                    return response.bodyToMono(String.class).flatMap(body -> {
                        System.err.println("GROQ ERROR DETAIL: " + body);
                        return reactor.core.publisher.Mono.error(new RuntimeException("Groq API Error: " + body));
                    });
                })
                .bodyToFlux(String.class)
                .doOnNext(chunk -> {
                    // System.out.println("DEBUG RAW CHUNK: " + chunk);
                })
                .flatMap(chunk -> {
                    if (chunk == null || chunk.isEmpty())
                        return Flux.empty();

                    String[] lines = chunk.split("\n");
                    return Flux.fromArray(lines)
                            .map(String::trim)
                            .filter(line -> line.startsWith("data:"))
                            .flatMap(line -> {
                                String json = line.substring(5).trim();
                                if (json.equals("[DONE]"))
                                    return Flux.empty();

                                try {
                                    JsonNode node = objectMapper.readTree(json);
                                    String content = node.path("choices").get(0)
                                            .path("delta").path("content").asText();
                                    if (content != null && !content.isEmpty()) {
                                        System.out.print(content);
                                        return Flux.just(content);
                                    }
                                } catch (Exception e) {
                                }
                                return Flux.empty();
                            });
                })
                .doOnError(e -> System.err.println("Groq Streaming Error: " + e.getMessage()));
    }
}