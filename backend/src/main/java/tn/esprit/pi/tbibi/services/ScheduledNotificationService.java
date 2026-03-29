package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.NotificationDTO;
import tn.esprit.pi.tbibi.entities.Laboratory_Result;
import tn.esprit.pi.tbibi.entities.Notification;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.Laboratory_ResultRepository;
import tn.esprit.pi.tbibi.repositories.NotificationRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledNotificationService {

    private final Laboratory_ResultRepository labRepo;
    private final NotificationRepository notificationRepo;
    private final SimpMessagingTemplate messagingTemplate;

    // ✅ Configurable dans application.properties
    @Value("${lab.notification.delay.minutes:5}")
    private int delayMinutes;

    // ✅ Vérifie toutes les 60 secondes
    @Scheduled(fixedRate = 60000)
    public void sendPendingNotifications() {

        LocalDateTime threshold = LocalDateTime.now().minusMinutes(delayMinutes);

        List<Laboratory_Result> pending =
                labRepo.findByScheduledNotifSentFalseAndCreatedAtBefore(threshold);

        if (pending.isEmpty()) {
            log.info("⏱ Scheduled check — aucune notification en attente");
            return;
        }

        for (Laboratory_Result lab : pending) {

            // ✅ Notification au patient
            if (lab.getPatient() != null) {
                sendNotificationToUser(lab, lab.getPatient(), "patient");
            }

            // ✅ NOUVEAU — Notification au médecin prescripteur
            if (lab.getPrescribedByDoctor() != null) {
                sendNotificationToUser(lab, lab.getPrescribedByDoctor(), "doctor");
            }

            // ✅ Marquer comme envoyé
            lab.setScheduledNotifSent(true);
            labRepo.save(lab);
        }
    }

    private void sendNotificationToUser(Laboratory_Result lab, User user, String userType) {
        Integer userId = user.getUserId();
        
        String message = userType.equals("patient")
                ? "📋 Vos résultats sont disponibles — Test: '" + lab.getTestName() 
                    + "' | Labo: " + lab.getNameLabo() + " | Statut: " + lab.getStatus()
                : "📋 Résultats disponibles pour votre patient — Test: '" + lab.getTestName() 
                    + "' | Patient: " + (lab.getPatient() != null ? lab.getPatient().getName() : "N/A")
                    + " | Statut: " + lab.getStatus();

        // ✅ 1. Créer l'entité Notification en base de données
        Notification notification = Notification.builder()
                .message(message)
                .read(false)
                .createdDate(LocalDateTime.now())
                .laboratoryResult(lab)
                .recipient(user)
                .build();
        notificationRepo.save(notification);

        // ✅ 2. Envoyer via WebSocket (temps réel)
        NotificationDTO notifDTO = NotificationDTO.builder()
                .patientId(userId)
                .message(message)
                .testName(lab.getTestName())
                .status(lab.getStatus())
                .date(LocalDate.now())
                .build();

        messagingTemplate.convertAndSend(
                "/topic/notifications/" + userId,
                notifDTO
        );

        log.info("✅ Notification envoyée au {} {} pour le test '{}'",
                userType, userId, lab.getTestName());
    }
}