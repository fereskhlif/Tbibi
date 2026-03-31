package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import tn.esprit.pi.tbibi.DTO.pharmacy.PharmacyRequest;
import tn.esprit.pi.tbibi.DTO.pharmacy.PharmacyResponse;
import tn.esprit.pi.tbibi.entities.Pharmacy;

@Mapper(componentModel = "spring")
public interface PharmacyMapper {
    Pharmacy toEntity(PharmacyRequest request);
    PharmacyResponse toDto(Pharmacy pharmacy);
}