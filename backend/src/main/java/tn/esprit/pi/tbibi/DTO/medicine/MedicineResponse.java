package tn.esprit.pi.tbibi.DTO.medicine;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.Date;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MedicineResponse {
    Long medicineId;
    String medicineName;
    Date dateOfExpiration;
    float price;
    int stock;
    int minStockAlert;
    boolean available;
    List<String> imageUrls;
    String description;
    String dosage;
}