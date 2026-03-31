package tn.esprit.pi.tbibi.DTO.medicine;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import tn.esprit.pi.tbibi.entities.MedicineForm;

import java.util.Date;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MedicineRequest {
    @NotBlank(message = "Medicine name is required")
    @Size(min = 2, max = 100, message = "Medicine name must be between 2 and 100 characters")
    String medicineName;

    @NotNull(message = "Expiration date is required")
    Date dateOfExpiration;

    @Positive(message = "Price must be greater than zero")
    float price;

    @PositiveOrZero(message = "Stock cannot be negative")
    int stock;

    @PositiveOrZero(message = "Min stock alert cannot be negative")
    int minStockAlert;

    @Size(max = 1000, message = "Description too long")
    String description;

    @NotBlank(message = "Dosage information is required")
    String dosage;

    @NotNull(message = "Pharmacy ID is required")
    Long pharmacyId;

    @NotNull(message = "Medicine form is required")
    MedicineForm form;

    String imageBase64;
    
    @NotBlank(message = "Active ingredient is required")
    String activeIngredient;
}