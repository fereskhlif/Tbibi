package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@ToString
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

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "patient_id")
    private List<MedicalReccords> medicalFiles;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;
}
