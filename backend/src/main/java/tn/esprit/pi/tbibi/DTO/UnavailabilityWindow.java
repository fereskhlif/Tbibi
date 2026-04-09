package tn.esprit.pi.tbibi.DTO;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnavailabilityWindow {
    /** "HH:mm" – start of blocked window */
    private String from;
    /** "HH:mm" – end of blocked window */
    private String to;
}
