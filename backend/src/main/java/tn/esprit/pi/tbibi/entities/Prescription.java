package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;

import java.util.Date;
import java.util.List;

@Entity
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int prescriptionID;
    private List<Medicine> medicines;
    private Date date;
    private String note;
    @ManyToOne
    Acte acte;

    @OneToMany(cascade = CascadeType.ALL, mappedBy="prescription")
    private List<Treatment> Treatments;

}
