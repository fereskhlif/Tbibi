package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineOcrResult;
import tn.esprit.pi.tbibi.services.GroqService;
import tn.esprit.pi.tbibi.services.OcrService;

@RestController
@RequestMapping("/api/ocr")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class OcrController {

    final OcrService ocrService;
    final GroqService groqService;

    @PostMapping(value = "/scan", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MedicineOcrResult> scan(
            @RequestParam("image") MultipartFile image) {
        try {
            // Step 1: OCR reads text
            String rawText = ocrService.extractTextFromImage(image);

            System.out.println("=== OCR RAW TEXT ===");
            System.out.println(rawText);
            System.out.println("====================");

            // Step 2: Vision AI reads image + OCR text combined
            MedicineOcrResult result = groqService.extractMedicineInfo(rawText, image);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}