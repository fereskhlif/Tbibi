package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Entity
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int role_id;

    private String name_patient;
    private String kine_name;
    private String docteur_name;
    private String pharmasis;
    private String laboratory_group;

    @OneToMany(mappedBy = "role")
    private List<User> users;
}