package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Builder
@Entity
@Table(name = "users")
@Getter
@Setter
@ToString(exclude = {"medicalFiles", "orders", "appointements", "laboratoryResults"})
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int  userId;

    private String name;
    private String email;
    private String password;
    private String adresse;
    private String specialty;

    private java.time.LocalDate dateOfBirth;
    private String gender;
    private String profilePicture;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "account_status")
    private UserStatus accountStatus = UserStatus.PENDING;

    @Builder.Default
    boolean enabled = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "patient_id")
    private List<MedicalReccords> medicalFiles;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user")
    private List<Order> orders;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user")
    private List<Appointment> appointements;

    @OneToMany(mappedBy = "laboratoryUser", cascade = CascadeType.ALL)
    private List<Laboratory_Result> laboratoryResults;

    @OneToMany
    private List<Teleconsultation> consultationRooms;
}