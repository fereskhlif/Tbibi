package tn.esprit.pi.tbibi.services.MedicalPictureAnalysisService;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis.MedicalPictureAnalysisRequest;
import tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis.MedicalPictureAnalysisResponse;
import tn.esprit.pi.tbibi.entities.Laboratory_Result;
import tn.esprit.pi.tbibi.entities.MedicalPictureAnalysis;
import tn.esprit.pi.tbibi.mappers.MedicalPictureAnalysisMapper;
import tn.esprit.pi.tbibi.repositories.Laboratory_ResultRepository;
import tn.esprit.pi.tbibi.repositories.MedicalPictureAnalysisRepository;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MedicalPictureAnalysisService implements IMedicalPictureAnalysisService {

    private final MedicalPictureAnalysisRepository picRepo;
    private final Laboratory_ResultRepository labRepo;
    private final MedicalPictureAnalysisMapper mapper;
    private final RestTemplate restTemplate;

    private static final String AI_SERVICE_URL = "http://localhost:5000/analyze";
    private static final String UPLOAD_DIR = "uploads/medical-pictures/";

    // ==================== CRUD DE BASE ====================

    @Override
    public MedicalPictureAnalysisResponse create(MedicalPictureAnalysisRequest request) {
        Laboratory_Result lab = labRepo.findById(request.getLaboratoryResultId())
                .orElseThrow(() -> new RuntimeException("Laboratory result not found with id: " + request.getLaboratoryResultId()));

        System.out.println(">>> REQUEST REÇU : " + request);
        System.out.println(">>> category = " + request.getCategory());
        System.out.println(">>> imageName = " + request.getImageName());
        System.out.println(">>> status = " + request.getStatus());

        MedicalPictureAnalysis pic = mapper.toEntity(request);
        pic.setLaboratoryResult(lab);
        pic.setUploadDate(LocalDate.now());

        if (pic.getStatus() == null || pic.getStatus().isEmpty()) {
            pic.setStatus("Pending");
        }

        return mapper.toResponse(picRepo.save(pic));
    }

    // ✅ Créer avec upload image + analyse IA automatique
    @Override
    public MedicalPictureAnalysisResponse createWithImage(
            MedicalPictureAnalysisRequest request,
            MultipartFile imageFile) throws IOException {


        // ✅ Ajoutez ici
        System.out.println(">>> category=" + request.getCategory()
                + " | status=" + request.getStatus()
                + " | history=" + request.getHistory());


        Laboratory_Result lab = labRepo.findById(request.getLaboratoryResultId()).get();

        // ✅ Sauvegarder l'image sur le serveur
        String fileName = UUID.randomUUID() + "_" + imageFile.getOriginalFilename();
        String filePath = UPLOAD_DIR + fileName;
        Files.createDirectories(Paths.get(UPLOAD_DIR));
        Files.write(Paths.get(filePath), imageFile.getBytes());

        MedicalPictureAnalysis pic = mapper.toEntity(request);
        pic.setLaboratoryResult(lab);
        pic.setImageName(fileName);
        pic.setImageType(imageFile.getContentType());
        pic.setImagePath(filePath);
        pic.setUploadDate(LocalDate.now());
        pic.setStatus("Pending");

        // ✅ Appel au service IA Python
        try {
            Map<String, Object> aiResult = callAiService(imageFile, request.getCategory());
            pic.setAnalysisResult((String) aiResult.get("analysisResult"));
            pic.setConfidenceScore(((Number) aiResult.get("confidenceScore")).doubleValue());
        } catch (Exception e) {
            pic.setAnalysisResult("AI analysis pending — service unavailable");
            pic.setConfidenceScore(0.0);
        }

        return mapper.toResponse(picRepo.save(pic));
    }

    // ✅ Appel HTTP vers le service Python Flask
    private Map<String, Object> callAiService(MultipartFile imageFile, String category) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", new ByteArrayResource(imageFile.getBytes()) {
            @Override
            public String getFilename() {
                return imageFile.getOriginalFilename();
            }
        });
        body.add("category", category != null ? category : "General");

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.exchange(AI_SERVICE_URL, HttpMethod.POST, requestEntity, Map.class);

        return response.getBody();
    }

    @Override
    public MedicalPictureAnalysisResponse getById(Integer id) {
        MedicalPictureAnalysis pic = picRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical picture analysis not found with id: " + id));
        return mapper.toResponse(pic);
    }

    @Override
    public List<MedicalPictureAnalysisResponse> getAll() {
        return picRepo.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MedicalPictureAnalysisResponse update(Integer id, MedicalPictureAnalysisRequest request) {
        MedicalPictureAnalysis pic = picRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical picture analysis not found with id: " + id));

        pic.setHistory(request.getHistory());
        pic.setImageName(request.getImageName());
        pic.setImageType(request.getImageType());
        pic.setImagePath(request.getImagePath());
        pic.setCategory(request.getCategory());
        pic.setAnalysisResult(request.getAnalysisResult());
        pic.setConfidenceScore(request.getConfidenceScore());
        pic.setStatus(request.getStatus());
        pic.setDoctorNote(request.getDoctorNote());
        pic.setValidationDate(request.getValidationDate());

        if (request.getLaboratoryResultId() != null) {
            Laboratory_Result lab = labRepo.findById(request.getLaboratoryResultId())
                    .orElseThrow(() -> new RuntimeException("Laboratory result not found with id: " + request.getLaboratoryResultId()));
            pic.setLaboratoryResult(lab);
        }

        return mapper.toResponse(picRepo.save(pic));
    }

    @Override
    public void delete(Integer id) {
        picRepo.deleteById(id);
    }

    // ✅ Valider une analyse
    @Override
    public MedicalPictureAnalysisResponse validateAnalysis(Integer id, String doctorNote) {
        MedicalPictureAnalysis pic = picRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical picture analysis not found with id: " + id));
        pic.setStatus("Validated");
        pic.setDoctorNote(doctorNote);
        pic.setValidationDate(LocalDate.now());
        return mapper.toResponse(picRepo.save(pic));
    }

    @Override
    public List<MedicalPictureAnalysisResponse> getByStatus(String status) {
        return picRepo.findByStatus(status)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicalPictureAnalysisResponse> getByCategory(String category) {
        return picRepo.findByCategory(category)
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }
}