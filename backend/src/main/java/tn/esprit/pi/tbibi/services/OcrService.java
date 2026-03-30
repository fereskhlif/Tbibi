package tn.esprit.pi.tbibi.services;

import net.sourceforge.tess4j.Tesseract;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.awt.image.RescaleOp;
import java.io.File;
import java.io.FileOutputStream;
import java.util.UUID;

@Service
public class OcrService {

    @Value("${tesseract.datapath}")
    private String datapath;

    public String extractTextFromImage(MultipartFile file) throws Exception {

        BufferedImage original = ImageIO.read(file.getInputStream());

        // Step 1: Resize to optimal width for OCR (1200px)
        int targetWidth = 1200;
        int targetHeight = (int) ((double) original.getHeight() * targetWidth / original.getWidth());
        BufferedImage resized = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = resized.createGraphics();
        g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
        g2d.drawImage(original, 0, 0, targetWidth, targetHeight, null);
        g2d.dispose();

        // Step 2: Convert to grayscale
        BufferedImage grayscale = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_BYTE_GRAY);
        Graphics g = grayscale.getGraphics();
        g.drawImage(resized, 0, 0, null);
        g.dispose();

        // Step 3: Increase contrast using RescaleOp
        RescaleOp rescaleOp = new RescaleOp(1.5f, -20, null);
        BufferedImage enhanced = rescaleOp.filter(grayscale, null);

        // Save as PNG
        File tempFile = File.createTempFile("ocr_" + UUID.randomUUID(), ".png");
        ImageIO.write(enhanced, "png", tempFile);

        try {
            Tesseract tesseract = new Tesseract();
            tesseract.setDatapath(datapath);
            tesseract.setLanguage("fra+eng");
            tesseract.setPageSegMode(6); // Assume uniform block of text
            tesseract.setOcrEngineMode(1); // LSTM neural net mode
            return tesseract.doOCR(tempFile);
        } finally {
            tempFile.delete();
        }
    }
}