package tn.esprit.pi.tbibi.DTO.pharmacy;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PharmacyRequest {
    String pharmacyName;
    String pharmacyAddress;
}
