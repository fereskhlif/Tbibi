package tn.esprit.pi.tbibi.DTO.pharmacy;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PharmacyResponse {
    Long pharmacyId;
    String pharmacyName;
    String pharmacyAddress;
    List<Long> orderIds;
}