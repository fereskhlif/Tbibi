package tn.esprit.pi.tbibi.DTO.orderline;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderLineResponse {
    Long lineId;
    int quantity;
    float unitPrice;
    Long medicineId;
    String medicineName;
}