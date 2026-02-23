package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineRequest;
import tn.esprit.pi.tbibi.DTO.medicine.MedicineResponse;
import tn.esprit.pi.tbibi.entities.Medicine;

@Mapper(componentModel = "spring")
public interface MedicineMapper {
    Medicine toEntity(MedicineRequest request);
    MedicineResponse toDto(Medicine medicine);
}