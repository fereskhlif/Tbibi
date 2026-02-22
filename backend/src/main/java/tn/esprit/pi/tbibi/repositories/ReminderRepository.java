package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.esprit.pi.tbibi.entities.Reminder;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

}