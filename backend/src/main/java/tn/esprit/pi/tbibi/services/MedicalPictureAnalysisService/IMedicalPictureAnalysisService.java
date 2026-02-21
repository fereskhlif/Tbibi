package tn.esprit.pi.tbibi.services.MedicalPictureAnalysisService;

import tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis.MedicalPictureAnalysisRequest;
import tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis.MedicalPictureAnalysisResponse;
import java.util.List;

public interface IMedicalPictureAnalysisService {

    MedicalPictureAnalysisResponse create(MedicalPictureAnalysisRequest request);
    MedicalPictureAnalysisResponse getById(Integer id);
    List<MedicalPictureAnalysisResponse> getAll();
    MedicalPictureAnalysisResponse update(Integer id, MedicalPictureAnalysisRequest request);
    void delete(Integer id);
}