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
    private String roleName;

    @OneToMany(mappedBy = "role")
    private List<User> users;
}