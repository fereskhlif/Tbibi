package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int role_id;
    private String name_patient;
    private String kine_name;
    private String docteur_name;
    private String pharmasis;
    private String laboratory_group;
}
