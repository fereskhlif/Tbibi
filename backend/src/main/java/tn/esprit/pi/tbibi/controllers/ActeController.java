package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.ActeDTO;
import tn.esprit.pi.tbibi.entities.Acte;
import tn.esprit.pi.tbibi.services.ActeService;

import java.util.List;

@RestController
@RequestMapping("/actes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ActeController {

    private final ActeService acteService;

    @GetMapping("/all")
    public ResponseEntity<List<ActeDTO>> getAll() {
        return ResponseEntity.ok(acteService.getAllActes());
    }
    @PostMapping("/add/{medicalFileId}")
    public ResponseEntity<Acte> addActe(
            @PathVariable int medicalFileId,
            @RequestBody Acte acte) {
        return ResponseEntity.ok(acteService.addActe(medicalFileId, acte));
    }
}