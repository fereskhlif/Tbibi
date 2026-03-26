package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Builder
@Entity
@Table(name = "users")
@Getter
@Setter
@ToString(exclude = { "medicalFiles", "Orders", "Appointements" }) // Exclude collections
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int userId;

    private String name;
    private String email;
    private String password;
    private String adresse;
    private String specialty;
    private String profilPicture;
    @Builder.Default
    boolean enabled = true;

    private java.time.LocalDate dateOfBirth;
    private String gender;
    private String profilePicture;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "account_status")
    private UserStatus accountStatus = UserStatus.PENDING;

    @Builder.Default
    @Column(name = "is_enabled")
    Boolean enabled = true;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "patient_id")
    private List<MedicalReccords> medicalFiles;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roleName")
    private Role role;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user")
    private List<Order> orders; // Changed to List and lowercase

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user")
    private List<Appointment> appointements; // Changed to List and lowercase

    @OneToMany
    private List<Teleconsultation> consultationRooms;
}