package tn.esprit.pi.tbibi.DTO;

import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long notificationId;
    private String message;
    private boolean read;
    private LocalDateTime createdDate;

    // Appointment details (from main)
    private Long appointmentId;
    private String patientName;
    private String specialty;
    private String reasonForVisit;
    private String statusAppointement;
    private String scheduleDate;
    private String scheduleTime;

    // Doctor (from main)
    private int doctorId;

    // Laboratory fields (from Lemin-pi)
    private Integer patientId;
    private String testName;
    private String status;
    private LocalDate date;
}
