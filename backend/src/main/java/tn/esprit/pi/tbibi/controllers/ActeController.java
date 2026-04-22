package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.ActeDTO;
import tn.esprit.pi.tbibi.entities.Acte;
import tn.esprit.pi.tbibi.repositories.UserRepo;
import tn.esprit.pi.tbibi.services.ActeService;

import java.util.List;

@RestController
@RequestMapping("/actes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ActeController {

    private final ActeService acteService;
    private final UserRepo userRepository;

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

    /**
     * Doctor selects patient once → creates an acte linked to that patient's medical file.
     * The doctor's ID is automatically retrieved from the security context.
     */
    @PostMapping("/add-for-patient/{patientId}")
    public ResponseEntity<Acte> addActeForPatient(
            @PathVariable int patientId,
            @RequestBody Acte acte) {
        // Capture doctorId from the currently authenticated user
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Integer doctorId = userRepository.findByEmail(email)
                .map(u -> u.getUserId())
                .orElse(null);
        return ResponseEntity.ok(acteService.addActeForPatient(patientId, acte, doctorId));
    }

    /**
     * Returns all PATIENT users for the doctor's dropdown.
     */
    @GetMapping("/patients")
    public ResponseEntity<List<ActeDTO>> getAllPatients() {
        return ResponseEntity.ok(acteService.getAllPatients());
    }

    /**
     * Returns only the actes for the currently authenticated patient.
     */
    @GetMapping("/my")
    public ResponseEntity<List<ActeDTO>> getMyActes() {
        return ResponseEntity.ok(acteService.getMyActes());
    }

    @GetMapping("/active-prescriptions/{medicalFileId}")
    public ResponseEntity<List<ActeDTO>> getActesWithActivePrescriptions(@PathVariable Integer medicalFileId) {
        return ResponseEntity.ok(acteService.getActesWithActivePrescriptions(medicalFileId));
    }

    @GetMapping("/active-prescriptions-for-patient/{patientId}")
    public ResponseEntity<List<ActeDTO>> getActesWithActivePrescriptionsForPatient(@PathVariable Integer patientId) {
        return ResponseEntity.ok(acteService.getActesWithActivePrescriptionsForPatient(patientId));
    }

    @GetMapping("/recent-active-prescriptions-for-doctor")
    public ResponseEntity<List<ActeDTO>> getDoctorRecentActesWithActivePrescriptions() {
        return ResponseEntity.ok(acteService.getDoctorRecentActesWithActivePrescriptions());
    }
}