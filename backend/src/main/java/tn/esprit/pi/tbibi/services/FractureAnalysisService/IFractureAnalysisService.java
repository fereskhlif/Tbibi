package tn.esprit.pi.tbibi.services.FractureAnalysisService;

import tn.esprit.pi.tbibi.DTO.dtoMedicalPictureAnalysis.FractureAnalysisResponse;

public interface IFractureAnalysisService {
    FractureAnalysisResponse analyzeImage(Integer picId);
    boolean checkAiServiceHealth();
}
