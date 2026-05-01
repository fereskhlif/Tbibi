package tn.esprit.pi.tbibi.services.PdfReportService;

import com.itextpdf.io.image.ImageDataFactory;
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
import tn.esprit.pi.tbibi.entities.MedicalPictureAnalysis;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.MedicalPictureAnalysisRepository;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfReportService implements IPdfReportService {

    private final MedicalPictureAnalysisRepository analysisRepo;
    
    private static final String UPLOAD_DIR = "uploads/medical-pictures/";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Override
    public ByteArrayOutputStream generateAnalysisReport(Integer analysisId) {
        log.info("📄 Génération du rapport PDF pour l'analyse ID: {}", analysisId);
        
        // Récupérer l'analyse
        MedicalPictureAnalysis analysis = analysisRepo.findById(analysisId)
                .orElseThrow(() -> new RuntimeException("Analyse introuvable avec ID: " + analysisId));
        
        Laboratory_Result labResult = analysis.getLaboratoryResult();
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        
        try {
            // Créer le document PDF
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);
            
            // ═══════════════════════════════════════════════════════════
            // EN-TÊTE
            // ═══════════════════════════════════════════════════════════
            Paragraph header = new Paragraph("RAPPORT D'ANALYSE RADIOLOGIQUE")
                    .setFontSize(20)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(new DeviceRgb(51, 122, 183));
            document.add(header);
            
            Paragraph subHeader = new Paragraph("Assisté par Intelligence Artificielle")
                    .setFontSize(12)
                    .setItalic()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.GRAY);
            document.add(subHeader);
            
            document.add(new Paragraph("\n"));
            
            // ═══════════════════════════════════════════════════════════
            // INFORMATIONS PATIENT
            // ═══════════════════════════════════════════════════════════
            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                    .useAllAvailableWidth();
            
            infoTable.addCell(createCell("Patient:", true));
            infoTable.addCell(createCell(getPatientName(labResult), false));
            
            infoTable.addCell(createCell("Date d'analyse:", true));
            infoTable.addCell(createCell(formatDate(analysis.getUploadDate()), false));
            
            infoTable.addCell(createCell("Catégorie:", true));
            infoTable.addCell(createCell(analysis.getCategory(), false));
            
            infoTable.addCell(createCell("Laboratoire:", true));
            infoTable.addCell(createCell(getLabName(labResult), false));
            
            document.add(infoTable);
            document.add(new Paragraph("\n"));
            
            // ═══════════════════════════════════════════════════════════
            // IMAGE RADIOLOGIQUE
            // ═══════════════════════════════════════════════════════════
            Paragraph imageTitle = new Paragraph("IMAGE RADIOLOGIQUE")
                    .setFontSize(14)
                    .setBold()
                    .setFontColor(new DeviceRgb(51, 122, 183));
            document.add(imageTitle);
            
            String imagePath = UPLOAD_DIR + analysis.getImageName();
            File imageFile = new File(imagePath);
            
            if (imageFile.exists()) {
                try {
                    Image img = new Image(ImageDataFactory.create(imagePath));
                    img.setWidth(400);
                    img.setAutoScale(true);
                    img.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER);
                    document.add(img);
                } catch (Exception e) {
                    log.warn("Cannot load image: {}", imagePath, e);
                    document.add(new Paragraph("⚠️ Image non disponible (format non reconnu)")
                            .setFontColor(ColorConstants.RED)
                            .setTextAlignment(TextAlignment.CENTER));
                }
            } else {
                document.add(new Paragraph("⚠️ Image non disponible (fichier introuvable)")
                        .setFontColor(ColorConstants.RED)
                        .setTextAlignment(TextAlignment.CENTER));
            }
            
            document.add(new Paragraph("\n"));
            
            // ═══════════════════════════════════════════════════════════
            // RÉSULTATS IA
            // ═══════════════════════════════════════════════════════════
            Paragraph aiTitle = new Paragraph("RÉSULTATS DE L'ANALYSE IA")
                    .setFontSize(14)
                    .setBold()
                    .setFontColor(new DeviceRgb(51, 122, 183));
            document.add(aiTitle);
            
            // Prédiction
            String prediction = analysis.getAnalysisResult();
            boolean isFracture = prediction != null && prediction.toLowerCase().contains("fracture");
            
            Paragraph predictionPara = new Paragraph()
                    .add(new Text("Prédiction: ").setBold())
                    .add(new Text(prediction != null ? prediction : "Non disponible")
                            .setFontColor(isFracture ? ColorConstants.RED : ColorConstants.GREEN)
                            .setBold());
            document.add(predictionPara);
            
            // Confiance
            if (analysis.getConfidenceScore() != null) {
                double confidence = analysis.getConfidenceScore() * 100;
                String confidenceLevel = getConfidenceLevel(analysis.getConfidenceScore());
                
                Paragraph confidencePara = new Paragraph()
                        .add(new Text("Niveau de confiance: ").setBold())
                        .add(new Text(String.format("%.1f%% (%s)", confidence, confidenceLevel)));
                document.add(confidencePara);
                
                // Barre de confiance visuelle
                Table confidenceBar = createConfidenceBar(analysis.getConfidenceScore());
                document.add(confidenceBar);
            }
            
            document.add(new Paragraph("\n"));
            
            // ═══════════════════════════════════════════════════════════
            // NOTES DU DOCTEUR
            // ═══════════════════════════════════════════════════════════
            if (analysis.getDoctorNote() != null && !analysis.getDoctorNote().isEmpty()) {
                Paragraph notesTitle = new Paragraph("NOTES DU DOCTEUR")
                        .setFontSize(14)
                        .setBold()
                        .setFontColor(new DeviceRgb(51, 122, 183));
                document.add(notesTitle);
                
                Paragraph notes = new Paragraph(analysis.getDoctorNote())
                        .setBackgroundColor(new DeviceRgb(248, 249, 250))
                        .setPadding(10);
                document.add(notes);
                
                document.add(new Paragraph("\n"));
            }
            
            // ═══════════════════════════════════════════════════════════
            // PIED DE PAGE
            // ═══════════════════════════════════════════════════════════
            document.add(new Paragraph("\n\n"));
            
            Paragraph footer = new Paragraph()
                    .add(new Text("Date de validation: ").setBold())
                    .add(new Text(formatDate(analysis.getValidationDate())))
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.RIGHT);
            document.add(footer);
            
            Paragraph disclaimer = new Paragraph(
                    "Ce rapport a été généré automatiquement par un système d'intelligence artificielle. " +
                    "Les résultats doivent être validés par un professionnel de santé qualifié.")
                    .setFontSize(8)
                    .setItalic()
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(disclaimer);
            
            // Fermer le document
            document.close();
            
            log.info("✅ Rapport PDF généré avec succès pour l'analyse ID: {}", analysisId);
            
        } catch (Exception e) {
            log.error("❌ Erreur lors de la génération du PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Erreur lors de la génération du rapport PDF", e);
        }
        
        return baos;
    }
    
    // ═══════════════════════════════════════════════════════════
    // MÉTHODES UTILITAIRES
    // ═══════════════════════════════════════════════════════════
    
    private Cell createCell(String content, boolean isBold) {
        Paragraph para = new Paragraph(content);
        if (isBold) {
            para.setBold();
        }
        return new Cell().add(para).setPadding(5);
    }
    
    private Table createConfidenceBar(double confidence) {
        Table bar = new Table(UnitValue.createPercentArray(new float[]{100}))
                .useAllAvailableWidth();
        
        float percentage = (float) (confidence * 100);
        DeviceRgb color = getConfidenceColor(confidence);
        
        Cell filledCell = new Cell()
                .setWidth(UnitValue.createPercentValue(percentage))
                .setBackgroundColor(color)
                .setHeight(20)
                .setBorder(null);
        
        bar.addCell(filledCell);
        return bar;
    }
    
    private DeviceRgb getConfidenceColor(double confidence) {
        if (confidence >= 0.8) {
            return new DeviceRgb(81, 207, 102); // Vert
        } else if (confidence >= 0.6) {
            return new DeviceRgb(255, 212, 59); // Jaune
        } else {
            return new DeviceRgb(255, 107, 107); // Rouge
        }
    }
    
    private String getConfidenceLevel(double confidence) {
        if (confidence >= 0.8) return "Haute";
        if (confidence >= 0.6) return "Moyenne";
        return "Faible";
    }
    
    private String getPatientName(Laboratory_Result labResult) {
        if (labResult != null && labResult.getPatient() != null) {
            User patient = labResult.getPatient();
            return patient.getName() != null ? patient.getName() : "Non renseigné";
        }
        return "Non renseigné";
    }
    
    private String getLabName(Laboratory_Result labResult) {
        if (labResult != null && labResult.getNameLabo() != null) {
            return labResult.getNameLabo();
        }
        return "Non renseigné";
    }
    
    private String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : "Non renseigné";
    }
}
