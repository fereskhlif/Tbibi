package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "Appointement")
@Getter
@Setter
@ToString
@EqualsAndHashCode
@NoArgsConstructor //
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appointmentId;
    private String service;
    private String specialty;
    private String doctor;
    private String patientName;

    private String reasonForVisit;
    private String meetingLink;
    private String patientEmail;

    @Enumerated(EnumType.STRING)
    private StatusAppointement statusAppointement;

    @ManyToOne(fetch = FetchType.EAGER)
    private Schedule schedule;
    @ManyToOne
    private User user;
    @OneToMany(mappedBy = "appointments", cascade = CascadeType.ALL)
    private List<Notification> notification = new ArrayList<>();
    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL)
    private Teleconsultation teleconsultation;

}
