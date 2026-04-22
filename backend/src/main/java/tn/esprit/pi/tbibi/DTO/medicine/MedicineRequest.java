package tn.esprit.pi.tbibi.DTO.medicine;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
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

    String dosage;

    @NotNull(message = "Pharmacy ID is required")
    Long pharmacyId;

    MedicineForm form;

    String imageBase64;

    String activeIngredient;
}