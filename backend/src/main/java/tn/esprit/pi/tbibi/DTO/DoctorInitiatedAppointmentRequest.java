package tn.esprit.pi.tbibi.DTO;

import lombok.*;

/**
 * Request payload for doctor-initiated appointments.
 * The doctor selects a patient, picks a date/time and specialty.
 * No schedule slot is needed — a slot is created on-the-fly.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorInitiatedAppointmentRequest {
    private Integer doctorId;      // the logged-in doctor
    private Integer patientId;     // the patient to book for
    private String  date;          // "yyyy-MM-dd"
    private String  startTime;     // "HH:mm"
    private String  specialty;
    private String  reasonForVisit;
}
