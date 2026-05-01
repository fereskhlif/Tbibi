package tn.esprit.pi.tbibi.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import tn.esprit.pi.tbibi.entities.PrescriptionStatus;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionRequest {
    // Model for prescription creation and update requests
    private String note;

    // Jackson deserializes ISO 8601 string from Angular into java.util.Date
    @JsonFormat(shape = JsonFormat.Shape.STRING,
            pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            timezone = "UTC")
    private Date date;

    @JsonFormat(shape = JsonFormat.Shape.STRING,
            pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            timezone = "UTC")
    private Date expirationDate;

    private PrescriptionStatus status;

    /** IDs of medicines selected by the doctor to include in this prescription. */
    private List<Long> medicineIds;
}