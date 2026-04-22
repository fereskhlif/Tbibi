package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.services.GemmaService;

import java.util.Map;

/**
 * AiChatController — exposes the Gemma AI medical assistant endpoint.
 *
 * POST /api/ai-chat/ask
 * Body: { "question": "I have a headache what should I do?" }
 * Response: { "answer": "..." }
 */
@RestController
@RequestMapping("/api/ai-chat")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:4201", "http://localhost:4202"})
@RequiredArgsConstructor
public class AiChatController {

    private final GemmaService gemmaService;

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> ask(@RequestBody Map<String, String> body) {
        String question = body.getOrDefault("question", "").trim();

        if (question.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Question cannot be empty"));
        }

        String answer = gemmaService.askMedical(question);
        return ResponseEntity.ok(Map.of("answer", answer));
    }
}
