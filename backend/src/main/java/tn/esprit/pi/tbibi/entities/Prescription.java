package tn.esprit.pi.tbibi.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@ToString(exclude = {"medicines", "Treatments", "acte"})
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int prescriptionID;

    @ManyToMany
    @JoinTable(
            name = "prescription_medicine",
            joinColumns = @JoinColumn(name = "prescription_id"),
            inverseJoinColumns = @JoinColumn(name = "medicine_id")
    )
    @JsonIgnore  // ← ADD THIS
    private List<Medicine> medicines;

    private Date date;
    private Date expirationDate;
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PrescriptionStatus status = PrescriptionStatus.PENDING;

    @Temporal(TemporalType.TIMESTAMP)
    private Date statusUpdatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acte_id")
    @JsonIgnore
    private Acte acte;
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "prescription")
    @JsonIgnore          // ← Treatment has @ManyToOne Prescription → circular
    private List<Treatment> treatments;

}