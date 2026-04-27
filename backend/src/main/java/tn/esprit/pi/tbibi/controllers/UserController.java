package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.pi.tbibi.DTO.UserProfileDTO;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.UserRepo;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping({"/api/users", "/api/user"})
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class UserController {

    private final UserRepo userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String UPLOAD_DIR = "uploads/profiles/";

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        log.info("=== GET PROFILE ===");
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        UserProfileDTO dto = new UserProfileDTO(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getAdresse(),
                user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null,
                user.getGender(),
                user.getProfilePicture(),
                user.getRole() != null ? user.getRole().getRoleName() : null);

        return ResponseEntity.ok(dto);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> body) {
        log.info("=== UPDATE PROFILE ===");
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        if (body.containsKey("name") && body.get("name") != null && !body.get("name").isBlank()) {
            user.setName(body.get("name"));
        }
        if (body.containsKey("email") && body.get("email") != null && !body.get("email").isBlank()) {
            user.setEmail(body.get("email"));
        }
        userRepository.save(user);

        UserProfileDTO dto2 = new UserProfileDTO(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getAdresse(),
                user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null,
                user.getGender(),
                user.getProfilePicture(),
                user.getRole() != null ? user.getRole().getRoleName() : null);

        return ResponseEntity.ok(dto2);
    }

    @PostMapping(value = "/profile-picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserProfileDTO> uploadProfilePicture(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        log.info("=== UPLOAD PROFILE PICTURE ===");

        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        try {
            // Create directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(fileName);

            // Save file
            Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

            // Update user profile picture path
            user.setProfilePicture(UPLOAD_DIR + fileName);
            userRepository.save(user);

            // Return updated profile dto
            UserProfileDTO dto = new UserProfileDTO(
                    user.getUserId(),
                    user.getName(),
                    user.getEmail(),
                    user.getAdresse(),
                    user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : null,
                    user.getGender(),
                    user.getProfilePicture(),
                    user.getRole() != null ? user.getRole().getRoleName() : null);

            return ResponseEntity.ok(dto);

        } catch (IOException e) {
            log.error("Failed to upload profile picture", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody tn.esprit.pi.tbibi.DTO.ChangePasswordRequest request) {
        log.info("=== CHANGE PASSWORD ===");
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("L'ancien mot de passe est incorrect.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/doctors")
    public ResponseEntity<List<UserProfileDTO>> getAllDoctors() {
        log.info("=== GET ALL DOCTORS ===");
        // Use JPQL query (entity-based join – more reliable than native SQL)
        List<User> doctors = userRepository.findAllDoctors();

        List<UserProfileDTO> doctorDtos = doctors.stream()
                .map(doctor -> new UserProfileDTO(
                        doctor.getUserId(),
                        doctor.getName(),
                        doctor.getEmail(),
                        doctor.getAdresse(),
                        doctor.getDateOfBirth() != null ? doctor.getDateOfBirth().toString() : null,
                        doctor.getGender(),
                        doctor.getProfilePicture(),
                        doctor.getRole() != null ? doctor.getRole().getRoleName() : null))
                .collect(Collectors.toList());

        log.info("Found {} doctors", doctorDtos.size());
        return ResponseEntity.ok(doctorDtos);
    }

    @GetMapping("/patients")
    public ResponseEntity<List<UserProfileDTO>> getAllPatients() {
        log.info("=== GET ALL PATIENTS ===");
        // Use JPQL query (entity-based join – avoids native SQL join column mismatch)
        List<User> patients = userRepository.findAllUsersByRoleName("PATIENT");

        List<UserProfileDTO> patientDtos = patients.stream()
                .map(patient -> new UserProfileDTO(
                        patient.getUserId(),
                        patient.getName(),
                        patient.getEmail(),
                        patient.getAdresse(),
                        patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : null,
                        patient.getGender(),
                        patient.getProfilePicture(),
                        patient.getRole() != null ? patient.getRole().getRoleName() : null))
                .collect(Collectors.toList());

        log.info("Found {} patients", patientDtos.size());
        return ResponseEntity.ok(patientDtos);
    }

    @GetMapping("/doctors/search")
    public ResponseEntity<List<UserProfileDTO>> searchDoctors(
            @RequestParam(value = "name", defaultValue = "") String name) {
        log.info("=== SEARCH DOCTORS ===");
        List<User> doctors;

        if (name == null || name.trim().isEmpty()) {
            doctors = userRepository.findAllDoctors();
        } else {
            doctors = userRepository.findDoctorsByNameContaining("%" + name + "%");
        }

        List<UserProfileDTO> doctorDtos = doctors.stream()
                .map(doctor -> new UserProfileDTO(
                        doctor.getUserId(),
                        doctor.getName(),
                        doctor.getEmail(),
                        doctor.getAdresse(),
                        doctor.getDateOfBirth() != null ? doctor.getDateOfBirth().toString() : null,
                        doctor.getGender(),
                        doctor.getProfilePicture(),
                        doctor.getRole() != null ? doctor.getRole().getRoleName() : null))
                .collect(Collectors.toList());

        log.info("Found {} doctors matching '{}'", doctorDtos.size(), name);
        return ResponseEntity.ok(doctorDtos);
    }

    @GetMapping("/patients/search")
    public ResponseEntity<List<UserProfileDTO>> searchPatients(
            @RequestParam(value = "name", defaultValue = "") String name) {
        log.info("=== SEARCH PATIENTS ===");
        List<User> patients;

        if (name == null || name.trim().isEmpty()) {
            patients = userRepository.findAllByRoleName("PATIENT");
        } else {
            patients = userRepository.searchPatientsByName(name);
        }

        List<UserProfileDTO> patientDtos = patients.stream()
                .map(patient -> new UserProfileDTO(
                        patient.getUserId(),
                        patient.getName(),
                        patient.getEmail(),
                        patient.getAdresse(),
                        patient.getDateOfBirth() != null ? patient.getDateOfBirth().toString() : null,
                        patient.getGender(),
                        patient.getProfilePicture(),
                        patient.getRole() != null ? patient.getRole().getRoleName() : null))
                .collect(Collectors.toList());

        log.info("Found {} patients matching '{}'", patientDtos.size(), name);
        return ResponseEntity.ok(patientDtos);
    }
}
