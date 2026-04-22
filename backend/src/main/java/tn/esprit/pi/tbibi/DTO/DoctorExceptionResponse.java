package tn.esprit.pi.tbibi.DTO;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorExceptionResponse {

    private Long id;
    private Integer doctorId;

    /** "yyyy-MM-dd" */
    private String date;

    /** "HH:mm" or null if whole-day block */
    private String fromTime;

    /** "HH:mm" or null if whole-day block */
    private String toTime;

    /** true when fromTime and toTime are both null */
    private boolean wholeDay;
}
