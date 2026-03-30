package tn.esprit.pi.tbibi.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Builder
@Entity
@Table(name = "users")
@Getter
@Setter
@ToString(exclude = {"medicalFiles", "orders", "appointements"})
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    private String name;
    private String email;
    private String password;
    private String adresse;
    private String specialty;
    private String profilePicture;

    private java.time.LocalDate dateOfBirth;
    private String gender;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "account_status")
    private UserStatus accountStatus = UserStatus.PENDING;

    @Builder.Default
    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "patient_id")
    private List<MedicalReccords> medicalFiles;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roleName")
    private Role role;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user")
    @JsonIgnore
    private List<Order> orders;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user")
    private List<Appointment> appointements;

    @OneToMany
    @JoinColumn(name = "user_id")
    private List<Teleconsultation> consultationRooms;

    @OneToOne
    @JoinColumn(name = "pharmacy_id")
    private Pharmacy pharmacy;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "author")
    @JsonIgnore
    private List<Post> posts;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "author")
    @JsonIgnore
    private List<Comment> comments;
}