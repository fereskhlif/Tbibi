package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;

@AllArgsConstructor
@Entity
@Getter
@Setter
@ToString
@NoArgsConstructor

public class MedicalReccords {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int medicalfile_id;
    private String imageLabo;
    private String result_ia;
    private String medical_historuy;
    private String chronic_diseas;
    private String rep_doc;
}