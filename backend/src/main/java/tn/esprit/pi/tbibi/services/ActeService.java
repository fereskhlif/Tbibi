package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.ActeDTO;
import tn.esprit.pi.tbibi.entities.Acte;
import tn.esprit.pi.tbibi.entities.MedicalReccords;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.*;
import tn.esprit.pi.tbibi.repositories.ActeRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

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

        // Retrouver le patient via medicalFile
        if (acte.getMedicalFile() != null) {
            int medicalFileId = acte.getMedicalFile().getMedicalfile_id();
            userRepository.findUserByMedicalFileId(medicalFileId)
                    .ifPresent(patient -> {
                        dto.setPatientId((int) patient.getUserId());
                        dto.setPatientName(patient.getName());
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
}