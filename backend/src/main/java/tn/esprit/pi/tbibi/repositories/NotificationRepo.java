package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.Notification;

import java.util.List;

public interface NotificationRepo extends JpaRepository<Notification, Long> {

    List<Notification> findByDoctorUserIdOrderByCreatedDateDesc(int doctorId);

    List<Notification> findByDoctorUserIdAndReadOrderByCreatedDateDesc(int doctorId, boolean read);

    long countByDoctorUserIdAndRead(int doctorId, boolean read);
}
