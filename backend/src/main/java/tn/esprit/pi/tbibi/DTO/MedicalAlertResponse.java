package tn.esprit.pi.tbibi.DTO;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalAlertResponse {

    private Long id;
    private String title;
    private String message;
    private String severity;
    private LocalDateTime createdAt;
    private boolean readStatus;
}