package tn.esprit.pi.tbibi.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "role")
@Data
@NoArgsConstructor
@AllArgsConstructor
<<<<<<< HEAD
=======
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private int role_id;
    @Column(unique = true)
    private String roleName;

<<<<<<< HEAD
    @Column(name = "role_name", unique = true, nullable = false)
    private String roleName;

=======
    @JsonIgnore
>>>>>>> a5a41a6973410d3da56e12cfe21532fcd06ee3b6
    @OneToMany(mappedBy = "role")
    private List<User> users;
}