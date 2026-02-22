package tn.esprit.pi.tbibi.DTO.medicine;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MedicineResponse {
    Long medicineId;
    String medicineName;
    int quantity;
    Date dateOfExpiration;
    float price;
    int stock;
}