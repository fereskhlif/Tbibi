package tn.esprit.pi.tbibi.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.ConsultationRoomRequest;
import tn.esprit.pi.tbibi.DTO.ConsultationRoomResponse;
import tn.esprit.pi.tbibi.services.IConsultationRoomService;

import java.util.List;

@RestController
@RequestMapping("/api/consultation-rooms")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ConsultationRoomController {

    private final IConsultationRoomService consultationRoomService;

    /**
     * Create a consultation room.
     * A unique roomCode is auto-generated and createdAt is set to now.
     */
    @PostMapping
    public ResponseEntity<ConsultationRoomResponse> create(
            @Valid @RequestBody ConsultationRoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(consultationRoomService.create(request));
    }

    /** Get all consultation rooms */
    @GetMapping
    public ResponseEntity<List<ConsultationRoomResponse>> getAll() {
        return ResponseEntity.ok(consultationRoomService.getAll());
    }

    /** Get a consultation room by its ID */
    @GetMapping("/{id}")
    public ResponseEntity<ConsultationRoomResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(consultationRoomService.getById(id));
    }

    /** Look up a room by its unique code (used when joining the session) */
    @GetMapping("/code/{roomCode}")
    public ResponseEntity<ConsultationRoomResponse> getByCode(@PathVariable String roomCode) {
        return ResponseEntity.ok(consultationRoomService.getByRoomCode(roomCode));
    }

    /** Update the expiry time of a consultation room */
    @PutMapping("/{id}")
    public ResponseEntity<ConsultationRoomResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody ConsultationRoomRequest request) {
        return ResponseEntity.ok(consultationRoomService.update(id, request));
    }

    /** Delete a consultation room */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        consultationRoomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
