package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.util.Date;
import java.util.List;

public class prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int prescriptionID;
    private List<Medicine> medicines;
    private Date date;
    private String note;
    @ManyToOne
    Acte acte;
}
