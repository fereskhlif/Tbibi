package tn.esprit.pi.tbibi.services.PdfReportService;

import java.io.ByteArrayOutputStream;

public interface IPdfReportService {
    
    /**
     * Génère un rapport PDF pour une analyse médicale
     * @param analysisId ID de l'analyse
     * @return ByteArrayOutputStream contenant le PDF
     */
    ByteArrayOutputStream generateAnalysisReport(Integer analysisId);
}
