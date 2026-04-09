package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.pi.tbibi.entities.DoctorException;

import java.time.LocalDate;
import java.util.List;

public interface DoctorExceptionRepo extends JpaRepository<DoctorException, Long> {

    List<DoctorException> findByDoctorUserId(int doctorId);

    List<DoctorException> findByDoctorUserIdAndDate(int doctorId, LocalDate date);

    @Modifying
    @Transactional
    void deleteByDoctorUserIdAndDate(int doctorId, LocalDate date);
}
