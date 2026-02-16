package tn.esprit.pi.tbibi.entities;
import java.time.LocalDate;
import jakarta.persistence.*;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reminderId;

    private LocalDate heureRappel;

    private Integer frequence;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;


}
