package tn.esprit.pi.tbibi.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import tn.esprit.pi.tbibi.entities.PrescriptionStatus;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionMinimalDTO {
    private int prescriptionId;
    private String note;
    private Date date;
    private PrescriptionStatus status;
}
