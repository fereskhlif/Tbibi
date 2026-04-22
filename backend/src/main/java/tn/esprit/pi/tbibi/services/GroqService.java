package tn.esprit.pi.tbibi.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineOcrResult;

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
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GroqService() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(30000);
        this.restTemplate = new RestTemplate(factory);
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
    """ + ocrText + """
    
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
    
    For category use ONLY: COUGH_AND_COLD, RESPIRATORY, FEVER_AND_PAIN,
    MUSCLE_AND_JOINT, ANTIBIOTIC, ANTIVIRAL, ANTIFUNGAL, DIGESTIVE,
    SKIN, WOUND_CARE, ALLERGY, EYE_AND_EAR, DIABETES, HYPERTENSION,
    CARDIAC, THYROID, ANXIETY_AND_SLEEP, URINARY,
    VITAMINS_AND_SUPPLEMENTS, ORAL_AND_DENTAL, OTHER
                    
    
    Rules:
    - medicineName: the main medicine name (e.g. ASPÉGIC)
    - dosage: number + unit (e.g. 500mg, 1g, 250ml)
    - description: what the medicine is used for
    - form: pharmaceutical form from the list above
    - activeIngredient: the active chemical substance
      * Read from image if visible
      * If not visible but you recognize the medicine, use your medical knowledge
      * If medicine is unknown, leave empty string
    - category: the therapeutic category of the medicine from the list above
      * Use your medical knowledge to determine this based on the medicine.
      * If unknown, leave empty string.
    - Return ONLY JSON, no markdown, no code blocks
    """;

        Map<String, Object> textContent = Map.of("type", "text", "text", prompt);
        Map<String, Object> imageContent = Map.of(
                "type", "image_url",
                "image_url", Map.of("url", "data:image/jpeg;base64," + base64Image)
        );

        Map<String, Object> requestBody = Map.of(
                "model", "meta-llama/llama-4-scout-17b-16e-instruct",
                "max_tokens", 500,
                "messages", List.of(
                        Map.of("role", "user", "content", List.of(textContent, imageContent))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                "https://api.groq.com/openai/v1/chat/completions",
                HttpMethod.POST,
                entity,
                String.class
        );

        JsonNode root = objectMapper.readTree(response.getBody());
        String content = root.path("choices").get(0)
                .path("message").path("content").asText();

        content = content.trim();
        if (content.startsWith("```")) {
            content = content.replaceAll("```json", "").replaceAll("```", "").trim();
        }

        MedicineOcrResult result = objectMapper.readValue(content, MedicineOcrResult.class);

        // ── Auto-research fallback ──────────────────────────────────────
        // If the AI detected the medicine name but missed critical fields,
        // make a second lightweight text-only call to research them.
        if (result.getMedicineName() != null && !result.getMedicineName().isBlank()) {
            boolean missingIngredient = result.getActiveIngredient() == null || result.getActiveIngredient().isBlank();
            boolean missingCategory   = result.getCategory() == null || result.getCategory().isBlank();
            boolean missingDescription = result.getDescription() == null || result.getDescription().isBlank();

            if (missingIngredient || missingCategory || missingDescription) {
                System.out.println("=== AI RESEARCH: Filling missing fields for " + result.getMedicineName() + " ===");
                try {
                    MedicineOcrResult researched = researchMedicineByName(
                            result.getMedicineName(),
                            result.getDosage()
                    );
                    if (missingIngredient && researched.getActiveIngredient() != null && !researched.getActiveIngredient().isBlank()) {
                        result.setActiveIngredient(researched.getActiveIngredient());
                        System.out.println("  → Filled activeIngredient: " + researched.getActiveIngredient());
                    }
                    if (missingCategory && researched.getCategory() != null && !researched.getCategory().isBlank()) {
                        result.setCategory(researched.getCategory());
                        System.out.println("  → Filled category: " + researched.getCategory());
                    }
                    if (missingDescription && researched.getDescription() != null && !researched.getDescription().isBlank()) {
                        result.setDescription(researched.getDescription());
                        System.out.println("  → Filled description: " + researched.getDescription());
                    }
                } catch (Exception e) {
                    System.out.println("  → Research fallback failed: " + e.getMessage());
                }
            }
        }

        return result;
    }

    /**
     * Text-only AI call that researches a medicine by its commercial name.
     * Used as a fallback when the image scan could not detect all fields.
     */
    public MedicineOcrResult researchMedicineByName(String medicineName, String dosage) throws Exception {

        String doseHint = (dosage != null && !dosage.isBlank()) ? " " + dosage : "";

        String prompt = """
    You are a pharmacist with expert medical knowledge.
    I need information about this medicine: %s%s

    Using your pharmaceutical knowledge, return ONLY a valid JSON:
    {
      "medicineName": "%s",
      "dosage": "%s",
      "description": "",
      "form": "",
      "activeIngredient": "",
      "category": ""
    }

    For form use ONLY: TABLET, CAPSULE, SYRUP, INJECTION, CREAM,
    OINTMENT, SUPPOSITORY, EYE_DROPS, SPRAY, PATCH, SACHET, POWDER, OTHER

    For category use ONLY: COUGH_AND_COLD, RESPIRATORY, FEVER_AND_PAIN,
    MUSCLE_AND_JOINT, ANTIBIOTIC, ANTIVIRAL, ANTIFUNGAL, DIGESTIVE,
    SKIN, WOUND_CARE, ALLERGY, EYE_AND_EAR, DIABETES, HYPERTENSION,
    CARDIAC, THYROID, ANXIETY_AND_SLEEP, URINARY,
    VITAMINS_AND_SUPPLEMENTS, ORAL_AND_DENTAL, OTHER

    Rules:
    - activeIngredient: the main active pharmaceutical substance (e.g. Paracetamol for Doliprane, Acetylsalicylic acid for Aspirin). This is REQUIRED.
    - description: a brief 1–2 sentence explanation of what this medicine treats
    - category: the best matching therapeutic category from the list
    - form: the most common pharmaceutical form of this medicine
    - Return ONLY JSON, no markdown, no code blocks, no explanations
    """.formatted(medicineName, doseHint, medicineName, dosage != null ? dosage : "");

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "max_tokens", 300,
                "temperature", 0.1,
                "messages", List.of(
                        Map.of("role", "user", "content", prompt)
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                "https://api.groq.com/openai/v1/chat/completions",
                HttpMethod.POST,
                entity,
                String.class
        );

        JsonNode root = objectMapper.readTree(response.getBody());
        String content = root.path("choices").get(0)
                .path("message").path("content").asText();

        content = content.trim();
        if (content.startsWith("```")) {
            content = content.replaceAll("```json", "").replaceAll("```", "").trim();
        }

        return objectMapper.readValue(content, MedicineOcrResult.class);
    }

    // Keep old method
    public MedicineOcrResult extractMedicineInfo(String rawText) throws Exception {
        return extractMedicineInfo(rawText, null);
    }
}