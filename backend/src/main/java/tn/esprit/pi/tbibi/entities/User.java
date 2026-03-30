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
<<<<<<< HEAD
@ToString(exclude = {"medicalFiles", "Orders", "Appointements"})
=======
@ToString(exclude = {"medicalFiles", "orders", "appointements"})
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
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
<<<<<<< HEAD
    @Builder.Default
    @Column(name = "is_enabled")
    Boolean enabled = true;
=======
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
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "patient_id")
    private List<MedicalReccords> medicalFiles;

<<<<<<< HEAD
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user")
=======
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "roleName")
    private Role role;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user")
    @JsonIgnore
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    private List<Order> orders;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user")
    private List<Appointment> appointements;
<<<<<<< HEAD
=======

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
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
}