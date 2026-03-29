package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.ActeDTO;
import tn.esprit.pi.tbibi.entities.Acte;
import tn.esprit.pi.tbibi.entities.MedicalReccords;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.*;
import tn.esprit.pi.tbibi.repositories.ActeRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActeService {

    private final ActeRepo acteRepository;
    private final UserRepo userRepository;
    private final MedicalReccordsRepo medicalReccordsRepository;
    public List<ActeDTO> getAllActes() {
        List<Acte> actes = acteRepository.findAll();
        System.out.println("=== ACTES TROUVÉS : " + actes.size()); // ← log
        actes.forEach(a -> {
            System.out.println("Acte #" + a.getActeId()
                    + " | medicalFile=" + (a.getMedicalFile() != null ? a.getMedicalFile().getMedicalfile_id() : "NULL")
                    + " | description=" + a.getDescription());
        });
        return actes.stream().map(this::toDTO).collect(Collectors.toList());
    }

    private ActeDTO toDTO(Acte acte) {
        ActeDTO dto = new ActeDTO();
        dto.setActeId(acte.getActeId());
        dto.setDescription(acte.getDescription());
        dto.setTypeOfActe(acte.getTypeOfActe());
        dto.setDate(acte.getDate());

        // Retrouver le patient via medicalFile
        if (acte.getMedicalFile() != null) {
            int medicalFileId = acte.getMedicalFile().getMedicalfile_id();
            userRepository.findPatientByMedicalFileId(medicalFileId)
                    .ifPresent(patient -> {
                        dto.setPatientId((int) patient.getUserId());
                        dto.setPatientName(patient.getName());
                    });
        }

        // Enrichir avec le médecin
        if (acte.getDoctorId() != null) {
            userRepository.findById((long) acte.getDoctorId()).ifPresent(doctor -> {
                dto.setDoctorId(doctor.getUserId());
                dto.setDoctorName(doctor.getName());
            });
        }

        return dto;
    }

    public Acte addActe(int medicalFileId, Acte acte) {
        MedicalReccords medicalFile = medicalReccordsRepository.findById(medicalFileId)
                .orElseThrow(() -> new RuntimeException("MedicalFile not found: " + medicalFileId));
        acte.setMedicalFile(medicalFile);
        return acteRepository.save(acte);
    }

    /**
     * Adds an Acte by resolving the patient's first medical file automatically.
     * The doctor selects the patient once; this method handles the rest.
     */
    public Acte addActeForPatient(int patientId, Acte acte) {
        return addActeForPatient(patientId, acte, null);
    }

    /**
     * Overloaded version that also stores the doctor's ID on the acte.
     * Called from the controller when the authenticated user is a doctor.
     */
    public Acte addActeForPatient(int patientId, Acte acte, Integer doctorId) {
        User patient = userRepository.findById((long) patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found: " + patientId));

        List<MedicalReccords> files = patient.getMedicalFiles();
        MedicalReccords medicalFile;

        if (files == null || files.isEmpty()) {
            medicalFile = new MedicalReccords();
            if (files == null) {
                patient.setMedicalFiles(new java.util.ArrayList<>(java.util.List.of(medicalFile)));
            } else {
                files.add(medicalFile);
            }
            userRepository.save(patient); // Save cascades to create the medical file
            files = patient.getMedicalFiles();
            medicalFile = files.get(files.size() - 1);
        } else {
            medicalFile = files.get(0);
        }

        acte.setMedicalFile(medicalFile);
        if (doctorId != null) {
            acte.setDoctorId(doctorId);
        }
        return acteRepository.save(acte);
    }

    /**
     * Returns all users with role PATIENT as lightweight ActeDTO (id + name).
     * Used by the frontend patient dropdown.
     */
    public List<ActeDTO> getAllPatients() {
        return userRepository.findAllUsersByRoleName("PATIENT").stream()
                .map(u -> {
                    ActeDTO dto = new ActeDTO();
                    dto.setPatientId(u.getUserId());
                    dto.setPatientName(u.getName());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Returns only the actes belonging to the currently authenticated patient.
     * Enriched with doctor info.
     */
    @jakarta.transaction.Transactional
    public List<ActeDTO> getMyActes() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User patient = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found: " + email));

        List<ActeDTO> result = new ArrayList<>();
        if (patient.getMedicalFiles() == null) return result;

        for (MedicalReccords medFile : patient.getMedicalFiles()) {
            if (medFile.getActes() == null) continue;
            for (Acte acte : medFile.getActes()) {
                result.add(toDTO(acte));
            }
        }
        return result;
    }
}