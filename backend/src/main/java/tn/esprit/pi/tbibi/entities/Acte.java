package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

import java.util.Date;

@AllArgsConstructor
@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor

public class Acte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int acte_id;
    private Date date;
    private String description;
    private String typeOfActe;

}
