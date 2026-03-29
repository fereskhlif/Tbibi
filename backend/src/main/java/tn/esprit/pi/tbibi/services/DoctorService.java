package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.DoctorDTO;
import tn.esprit.pi.tbibi.DTO.ScheduleResponse;
import tn.esprit.pi.tbibi.repositories.ScheduleRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService implements IDoctorService {

    private final UserRepo userRepo;
    private final ScheduleRepo scheduleRepo;

    @Override
    public List<String> getAllSpecialties() {
        // Return empty list for now - specialty field doesn't exist in User entity
        return new ArrayList<>();
    }

    @Override
    public List<DoctorDTO> getDoctorsBySpecialty(String specialty) {
        // Return empty list for now - specialty field doesn't exist in User entity
        return new ArrayList<>();
    }

    @Override
    public List<DoctorDTO> getDoctorsByName(String name) {
        // Return empty list for now - need to implement proper doctor search
        return new ArrayList<>();
    }

    @Override
    public List<ScheduleResponse> getAvailableSchedules(Integer doctorId) {
        // Return empty list for now - need proper schedule mapping
        return new ArrayList<>();
    }

    @Override
    public List<?> getDebugInfo() {
        return userRepo.findAllByRoleName("DOCTOR");
    }
}
