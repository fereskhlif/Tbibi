package tn.esprit.pi.tbibi.DTO;

import lombok.Data;

/** Response from POST /api/terra/connect — contains the Terra widget URL */
@Data
public class TerraWidgetDTO {
    private String url;
    private String sessionId;
    private boolean alreadyConnected;
    private String provider;
}
