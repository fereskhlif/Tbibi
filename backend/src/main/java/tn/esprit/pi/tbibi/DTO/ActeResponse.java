package tn.esprit.pi.tbibi.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActeResponse {
    private int acteId;
    private String date;
    private String description;
    private String typeOfActe;
    private List<PrescriptionResponse> prescriptions;
}
