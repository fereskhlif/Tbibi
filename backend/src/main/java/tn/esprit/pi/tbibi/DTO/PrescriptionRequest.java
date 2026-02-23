package tn.esprit.pi.tbibi.DTO;

import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import lombok.*;
import tn.esprit.pi.tbibi.entities.Medicine;

import java.util.Date;
import java.util.List;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionRequest {
    //private List<Medicine> medicines;
    private Date date;
    private String note;
}
