package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.DoctorDTO;
import tn.esprit.pi.tbibi.DTO.ScheduleResponse;
import tn.esprit.pi.tbibi.entities.User;
import java.util.List;

public interface IDoctorService {
    List<String> getAllSpecialties();

    List<DoctorDTO> getDoctorsBySpecialty(String specialty);

    List<DoctorDTO> getDoctorsByName(String name);

    List<ScheduleResponse> getAvailableSchedules(Integer doctorId);

    List<?> getDebugInfo();
}
