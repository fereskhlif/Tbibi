package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.DoctorExceptionRequest;
import tn.esprit.pi.tbibi.DTO.DoctorExceptionResponse;
import tn.esprit.pi.tbibi.services.IDoctorExceptionService;

import java.util.List;

@RestController
@RequestMapping("/api/doctor/exceptions")
@RequiredArgsConstructor
public class DoctorExceptionController {

    private final IDoctorExceptionService exceptionService;

    /** Add a date-specific exception (whole day or specific hours) */
    @PostMapping
    public ResponseEntity<DoctorExceptionResponse> addException(
            @RequestBody DoctorExceptionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(exceptionService.addException(request));
    }

    /** Get all exceptions for a doctor */
    @GetMapping("/{doctorId}")
    public ResponseEntity<List<DoctorExceptionResponse>> getExceptions(
            @PathVariable Integer doctorId) {
        return ResponseEntity.ok(exceptionService.getExceptions(doctorId));
    }

    /** Delete a specific exception (restores the affected slots) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteException(@PathVariable Long id) {
        exceptionService.deleteException(id);
        return ResponseEntity.noContent().build();
    }
}
