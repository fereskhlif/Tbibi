package tn.esprit.pi.tbibi.schedulers;

import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tn.esprit.pi.tbibi.entities.Medicine;
import tn.esprit.pi.tbibi.repositories.MedicineRepository;

import java.util.Date;
import java.util.List;

/**
 * Dedicated scheduler for Medicine-related background tasks.
 */
@Component
@AllArgsConstructor
public class MedicineScheduler {

    private final MedicineRepository medicineRepo;

    /**
     * Daily task to check for expired medicines.
     * Marks them as unavailable and clears their stock.
     */
    @Scheduled(cron = "0 0 0 * * ?") // Runs every day at midnight
    @Transactional
    public void updateExpiredMedicinesStatus() {
        List<Medicine> expiredMedicines = medicineRepo.findByDateOfExpirationBeforeAndAvailableTrue(new Date());
        if (!expiredMedicines.isEmpty()) {
            for (Medicine medicine : expiredMedicines) {
                medicine.setAvailable(false);
                medicine.setStock(0);
            }
            medicineRepo.saveAll(expiredMedicines);
            System.out.println("Scheduler executed: Updated " + expiredMedicines.size() + " expired medicines.");
        }
    }
}
