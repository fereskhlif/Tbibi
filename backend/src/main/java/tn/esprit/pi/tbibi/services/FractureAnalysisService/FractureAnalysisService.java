package tn.esprit.pi.tbibi.services.FractureAnalysisService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis.FractureAnalysisResponse;
import tn.esprit.pi.tbibi.entities.MedicalPictureAnalysis;
import tn.esprit.pi.tbibi.repositories.MedicalPictureAnalysisRepository;

import java.io.File;
import java.util.Map;

@Service
@AllArgsConstructor
@Slf4j
public class FractureAnalysisService implements IFractureAnalysisService {

    private final MedicalPictureAnalysisRepository repo;
    private final RestTemplate restTemplate;

    private static final String AI_SERVICE_URL = "http://localhost:5000/predict";
    private static final String UPLOAD_DIR = "uploads/medical-pictures/";

    @Override
    public FractureAnalysisResponse analyzeImage(Integer picId) {
        log.info("🔬 Début de l'analyse IA pour l'image ID: {}", picId);

        // 1. Récupérer l'analyse médicale
        MedicalPictureAnalysis analysis = repo.findById(picId)
                .orElseThrow(() -> new RuntimeException("Analyse médicale introuvable avec ID: " + picId));

        if (analysis.getImageName() == null || analysis.getImageName().isEmpty()) {
            throw new RuntimeException("Aucune image associée à cette analyse");
        }

        // 2. Préparer le chemin de l'image
        String imagePath = UPLOAD_DIR + analysis.getImageName();
        File imageFile = new File(imagePath);

        if (!imageFile.exists()) {
            throw new RuntimeException("Fichier image introuvable: " + imagePath);
        }

        log.info("📁 Image trouvée: {}", imagePath);

        try {
            // 3. Préparer la requête multipart
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", new FileSystemResource(imageFile));

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 4. Appeler le service Python
            log.info("🚀 Appel du service IA: {}", AI_SERVICE_URL);
            ResponseEntity<Map> response = restTemplate.exchange(
                    AI_SERVICE_URL,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> result = response.getBody();

                // 5. Extraire les résultats
                String prediction = (String) result.get("prediction");
                Double confidence = ((Number) result.get("confidence")).doubleValue();
                String message = (String) result.get("message");
                String warning = (String) result.get("warning");
                String confidenceLevel = (String) result.get("confidence_level");

                @SuppressWarnings("unchecked")
                Map<String, Double> probabilities = (Map<String, Double>) result.get("probabilities");

                log.info("✅ Prédiction: {} (confiance: {}%)", prediction, confidence * 100);

                // 6. Mettre à jour l'analyse dans la base de données
                analysis.setAnalysisResult(message);
                analysis.setConfidenceScore(confidence);
                analysis.setStatus("Completed");
                repo.save(analysis);

                log.info("💾 Analyse mise à jour dans la base de données");

                // 7. Retourner la réponse
                return FractureAnalysisResponse.builder()
                        .picId(picId)
                        .prediction(prediction)
                        .confidence(confidence)
                        .confidenceLevel(confidenceLevel)
                        .probabilities(probabilities)
                        .message(message)
                        .warning(warning)
                        .analysisUpdated(true)
                        .build();
            } else {
                throw new RuntimeException("Réponse invalide du service IA");
            }

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'analyse IA: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de l'analyse IA: " + e.getMessage());
        }
    }

    @Override
    public boolean checkAiServiceHealth() {
        try {
            String healthUrl = "http://localhost:5000/health";
            ResponseEntity<Map> response = restTemplate.getForEntity(healthUrl, Map.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.error("❌ Service IA non disponible: {}", e.getMessage());
            return false;
        }
    }
}
