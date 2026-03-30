package tn.esprit.pi.tbibi.entities;
<<<<<<< HEAD
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
=======

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;
import java.util.ArrayList;
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6

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
<<<<<<< HEAD
    private String doctor;
    private String specialty;
    private String reasonForVisit;
    private String service;
    @Enumerated(EnumType.STRING)
    private StatusAppointement statusAppointement;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Schedule schedule;
    @ManyToOne
    private User user;

}
=======
    private String service;
    private String specialty;
    private String doctor;
    private String patientName;

    private String reasonForVisit;
    private String meetingLink;

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
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
