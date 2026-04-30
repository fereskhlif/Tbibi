package tn.esprit.pi.tbibi.services.LabResultPdfService;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.entities.Laboratory_Result;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.Laboratory_ResultRepository;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class LabResultPdfService implements ILabResultPdfService {

    private final Laboratory_ResultRepository labResultRepo;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    public ByteArrayOutputStream generateLabResultReport(Integer labResultId) {
        try {
            Laboratory_Result labResult = labResultRepo.findById(labResultId)
                    .orElseThrow(() -> new RuntimeException("Lab result not found with id: " + labResultId));

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Header
            addHeader(document, labResult);
            
            // Patient Information
            addPatientInfo(document, labResult);
            
            // Test Information
            addTestInfo(document, labResult);
            
            // Results
            addResults(document, labResult);
            
            // Footer
            addFooter(document, labResult);

            document.close();
            log.info("PDF generated successfully for lab result ID: {}", labResultId);
            
            return baos;
        } catch (Exception e) {
            log.error("Error generating PDF for lab result ID: {}", labResultId, e);
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    private void addHeader(Document document, Laboratory_Result labResult) {
        Paragraph header = new Paragraph("RAPPORT D'ANALYSE DE LABORATOIRE")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(new DeviceRgb(41, 128, 185));
        document.add(header);

        Paragraph subHeader = new Paragraph(labResult.getNameLabo())
                .setFontSize(14)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY);
        document.add(subHeader);

        document.add(new Paragraph("\n"));
    }

    private void addPatientInfo(Document document, Laboratory_Result labResult) {
        document.add(new Paragraph("INFORMATIONS PATIENT")
                .setFontSize(14)
                .setBold()
                .setFontColor(new DeviceRgb(52, 73, 94)));

        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
                .useAllAvailableWidth()
                .setMarginBottom(15);

        User patient = labResult.getPatient();
        if (patient != null) {
            addTableRow(table, "Nom du patient", patient.getName() != null ? patient.getName() : "Non renseigné");
            addTableRow(table, "Date de naissance", patient.getDateOfBirth() != null ? 
                    patient.getDateOfBirth().format(DATE_FORMATTER) : "Non renseigné");
            addTableRow(table, "Sexe", patient.getGender() != null ? patient.getGender() : "Non renseigné");
        } else {
            addTableRow(table, "Patient", "Non renseigné");
        }

        document.add(table);
        document.add(new Paragraph("\n"));
    }

    private void addTestInfo(Document document, Laboratory_Result labResult) {
        document.add(new Paragraph("INFORMATIONS SUR LE TEST")
                .setFontSize(14)
                .setBold()
                .setFontColor(new DeviceRgb(52, 73, 94)));

        Table table = new Table(UnitValue.createPercentArray(new float[]{1, 2}))
                .useAllAvailableWidth()
                .setMarginBottom(15);

        addTableRow(table, "Nom du test", labResult.getTestName() != null ? labResult.getTestName() : "Non renseigné");
        addTableRow(table, "Date du test", labResult.getTestDate() != null ? 
                labResult.getTestDate().format(DATE_FORMATTER) : "Non renseigné");
        addTableRow(table, "Localisation", labResult.getLocation() != null ? labResult.getLocation() : "Non renseigné");
        addTableRow(table, "Statut", labResult.getStatus() != null ? labResult.getStatus() : "Non renseigné");
        addTableRow(table, "Priorité", labResult.getPriority() != null ? labResult.getPriority() : "Normal");

        User doctor = labResult.getPrescribedByDoctor();
        if (doctor != null && doctor.getName() != null) {
            addTableRow(table, "Prescrit par", "Dr. " + doctor.getName());
        }

        User labUser = labResult.getLaboratoryUser();
        if (labUser != null && labUser.getName() != null) {
            addTableRow(table, "Technicien", labUser.getName());
        }

        document.add(table);
        document.add(new Paragraph("\n"));
    }

    private void addResults(Document document, Laboratory_Result labResult) {
        document.add(new Paragraph("RÉSULTATS")
                .setFontSize(14)
                .setBold()
                .setFontColor(new DeviceRgb(52, 73, 94)));

        Div resultBox = new Div()
                .setBackgroundColor(new DeviceRgb(236, 240, 241))
                .setPadding(15)
                .setMarginBottom(15);

        if (labResult.getResultValue() != null && !labResult.getResultValue().isEmpty()) {
            Paragraph resultText = new Paragraph(labResult.getResultValue())
                    .setFontSize(12);
            resultBox.add(resultText);
        } else {
            Paragraph noResult = new Paragraph("Aucun résultat disponible")
                    .setFontSize(12)
                    .setItalic()
                    .setFontColor(ColorConstants.GRAY);
            resultBox.add(noResult);
        }

        document.add(resultBox);

        // Notes de demande
        if (labResult.getRequestNotes() != null && !labResult.getRequestNotes().isEmpty()) {
            document.add(new Paragraph("NOTES DE DEMANDE")
                    .setFontSize(12)
                    .setBold()
                    .setMarginTop(10));
            
            Paragraph notes = new Paragraph(labResult.getRequestNotes())
                    .setFontSize(11)
                    .setItalic()
                    .setFontColor(new DeviceRgb(127, 140, 141));
            document.add(notes);
        }

        document.add(new Paragraph("\n"));
    }

    private void addFooter(Document document, Laboratory_Result labResult) {
        document.add(new Paragraph("\n\n"));
        
        Paragraph validationDate = new Paragraph("Date de validation: " + 
                (labResult.getTestDate() != null ? labResult.getTestDate().format(DATE_FORMATTER) : 
                LocalDate.now().format(DATE_FORMATTER)))
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setFontColor(ColorConstants.GRAY);
        document.add(validationDate);

        Paragraph disclaimer = new Paragraph(
                "Ce document est un rapport médical confidentiel. " +
                "Il doit être interprété par un professionnel de santé qualifié.")
                .setFontSize(9)
                .setTextAlignment(TextAlignment.CENTER)
                .setItalic()
                .setFontColor(ColorConstants.GRAY)
                .setMarginTop(10);
        document.add(disclaimer);
    }

    private void addTableRow(Table table, String label, String value) {
        table.addCell(new Cell()
                .add(new Paragraph(label).setBold())
                .setBackgroundColor(new DeviceRgb(236, 240, 241))
                .setPadding(8));
        
        table.addCell(new Cell()
                .add(new Paragraph(value != null ? value : "Non renseigné"))
                .setPadding(8));
    }
}
