package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.DoctorDTO;
import tn.esprit.pi.tbibi.DTO.ScheduleResponse;
import tn.esprit.pi.tbibi.Mapper.IAppointementMapper;
import tn.esprit.pi.tbibi.entities.Schedule;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.ScheduleRepo;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import java.util.List;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class DoctorService implements IDoctorService {

    private final UserRepo userRepo;
    private final ScheduleRepo scheduleRepo;
    private final IAppointementMapper mapper;

    @Override
    public List<String> getAllSpecialties() {
        return userRepo.findDistinctSpecialties();
    }

    private DoctorDTO toDoctorDTO(User u) {
        return DoctorDTO.builder()
                .userId(u.getUserId())
                .name(u.getName())
                .email(u.getEmail())
                .specialty(u.getSpecialty())
                .adresse(u.getAdresse())
                .profilPicture(u.getProfilPicture())
                .build();
    }

    @Override
    public List<DoctorDTO> getDoctorsBySpecialty(String specialty) {
        if (specialty == null || specialty.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return userRepo.findDoctorsBySpecialty(specialty).stream()
                .map(this::toDoctorDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<DoctorDTO> getDoctorsByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String pattern = "%" + name.trim() + "%";
        return userRepo.findDoctorsByNameContaining(pattern).stream()
                .map(this::toDoctorDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public List<ScheduleResponse> getAvailableSchedules(Integer doctorId) {
        System.out.println("DEBUG: Fetching schedules for doctorId: " + doctorId);
        List<Schedule> schedules = scheduleRepo.findByDoctorUserIdAndIsAvailableTrue(doctorId);
        System.out.println("DEBUG: Found " + schedules.size() + " available schedules");
        return mapper.toScheduleResponseList(schedules);
    }

    @Override
    public List<?> getDebugInfo() {
        return userRepo.findDebugInfo();
    }
}
