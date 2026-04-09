package tn.esprit.pi.tbibi.DTO;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorExceptionRequest {

    private Integer doctorId;

    /** "yyyy-MM-dd" */
    private String date;

    /**
     * "HH:mm" — null or empty means WHOLE DAY blocked.
     */
    private String fromTime;

    /**
     * "HH:mm" — null or empty means WHOLE DAY blocked.
     */
    private String toTime;
}
