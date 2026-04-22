package tn.esprit.pi.tbibi.services.MedicalPictureAnalysisService;

import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis.MedicalPictureAnalysisRequest;
import tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis.MedicalPictureAnalysisResponse;

import java.io.IOException;
import java.util.List;

public interface IMedicalPictureAnalysisService {

    // CRUD de base
    MedicalPictureAnalysisResponse create(MedicalPictureAnalysisRequest request);
    MedicalPictureAnalysisResponse getById(Integer id);
    List<MedicalPictureAnalysisResponse> getAll();
    MedicalPictureAnalysisResponse update(Integer id, MedicalPictureAnalysisRequest request);
    void delete(Integer id);

    // ✅ Créer avec upload image + analyse IA automatique
    MedicalPictureAnalysisResponse createWithImage(
            MedicalPictureAnalysisRequest request,
            MultipartFile imageFile) throws IOException;

    // Avancé
    MedicalPictureAnalysisResponse validateAnalysis(Integer id, String doctorNote);
    List<MedicalPictureAnalysisResponse> getByStatus(String status);
    List<MedicalPictureAnalysisResponse> getByCategory(String category);
}