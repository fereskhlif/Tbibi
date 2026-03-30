package tn.esprit.pi.tbibi.DTO.medicine;

import lombok.*;
import lombok.experimental.FieldDefaults;
import tn.esprit.pi.tbibi.entities.MedicineForm;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)

public class MedicineOcrResult {
    String medicineName;
    String dosage;
    String description;
    MedicineForm form;
    String activeIngredient;
}
