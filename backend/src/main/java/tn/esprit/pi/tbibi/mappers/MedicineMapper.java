package tn.esprit.pi.tbibi.mappers;

import tn.esprit.pi.tbibi.DTO.medicine.MedicineRequest;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineResponse;
import tn.esprit.pi.tbibi.entities.Medicine;

public class MedicineMapper {

    public static Medicine toEntity(MedicineRequest request) {
        return Medicine.builder()
                .medicineName(request.getMedicineName())
                .quantity(request.getQuantity())
                .dateOfExpiration(request.getDateOfExpiration())
                .price(request.getPrice())
                .stock(request.getStock())
                .build();
    }

    public static MedicineResponse toResponse(Medicine medicine) {
        return MedicineResponse.builder()
                .medicineId(medicine.getMedicineId())
                .medicineName(medicine.getMedicineName())
                .quantity(medicine.getQuantity())
                .dateOfExpiration(medicine.getDateOfExpiration())
                .price(medicine.getPrice())
                .stock(medicine.getStock())
                .build();
    }
}