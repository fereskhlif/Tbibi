package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.Set;

@Builder
@Entity
@Table(name = "users")
@Getter
@Setter
@ToString(exclude = {"medicalFiles", "Orders", "Appointements"}) // Exclude collections
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
    @Builder.Default
    boolean enabled = true;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "patient_id")
    private List<MedicalReccords> medicalFiles;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user")
    private List<Order> orders;  // Changed to List and lowercase

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "user")
    private List<Appointement> appointements;  // Changed to List and lowercase
}