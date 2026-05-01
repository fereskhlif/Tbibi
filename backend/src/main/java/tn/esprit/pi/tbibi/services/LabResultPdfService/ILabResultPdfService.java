package tn.esprit.pi.tbibi.services.LabResultPdfService;

import java.io.ByteArrayOutputStream;

public interface ILabResultPdfService {
    ByteArrayOutputStream generateLabResultReport(Integer labResultId);
}
