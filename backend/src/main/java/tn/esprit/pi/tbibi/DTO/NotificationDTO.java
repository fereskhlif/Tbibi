package tn.esprit.pi.tbibi.DTO;

import lombok.*;

import java.time.LocalDateTime;

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

    // Appointment details
    private Long appointmentId;
    private String patientName;
    private String specialty;
    private String reasonForVisit;
    private String statusAppointement;
    private String scheduleDate;
    private String scheduleTime;

    // Doctor
    private int doctorId;

    // Generic Notification properties
    private String type;
    private String title;
    private Integer prescriptionId;
}
