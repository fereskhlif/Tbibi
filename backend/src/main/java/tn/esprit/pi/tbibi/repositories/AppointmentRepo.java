package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.esprit.pi.tbibi.entities.Appointment;
import tn.esprit.pi.tbibi.entities.StatusAppointement;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepo extends JpaRepository<Appointment, Long> {
       List<Appointment> findByDoctor(String doctor);

       /** All appointments whose schedule belongs to this doctor (by user ID) */
       @Query("SELECT a FROM Appointment a JOIN FETCH a.schedule s JOIN s.doctor d WHERE d.userId = :doctorId ORDER BY s.date DESC, s.startTime DESC")
       List<Appointment> findByDoctorUserId(@Param("doctorId") Integer doctorId);

       List<Appointment> findByStatusAppointement(StatusAppointement status);

       List<Appointment> findByScheduleScheduleId(Long scheduleId);

       List<Appointment> findBySpecialty(String specialty);

       List<Appointment> findBySpecialtyIgnoreCase(String specialty);

       @Query("SELECT a FROM Appointment a " +
                     "JOIN FETCH a.user u " +
                     "LEFT JOIN FETCH a.schedule s " +
                     "WHERE u.userId = :userId " +
                     "ORDER BY s.date ASC NULLS LAST, s.startTime ASC NULLS LAST")
       List<Appointment> findByUserUserId(@Param("userId") int userId);

       @Query("SELECT s.doctor.name, a.specialty, COUNT(a) " +
                     "FROM Appointment a " +
                     "JOIN a.schedule s " +
                     "JOIN s.doctor d " +
                     "WHERE d.userId = :doctorId " +
                     "GROUP BY s.doctor.name, a.specialty " +
                     "ORDER BY COUNT(a) DESC")
       List<Object[]> findSpecialtyStatsByDoctor(@Param("doctorId") Integer doctorId);

       List<Appointment> findByScheduleDateBetweenAndStatusAppointementAndScheduleDoctorUserId(
                     LocalDate from,
                     LocalDate to,
                     StatusAppointement status,
                     Integer doctorId);
}
