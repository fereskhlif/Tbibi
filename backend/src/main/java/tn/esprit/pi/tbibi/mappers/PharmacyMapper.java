package tn.esprit.pi.tbibi.mappers;

import tn.esprit.pi.tbibi.DTO.pharmacy.PharmacyRequest;
import tn.esprit.pi.tbibi.DTO.pharmacy.PharmacyResponse;
import tn.esprit.pi.tbibi.entities.Order;
import tn.esprit.pi.tbibi.entities.Pharmacy;

import java.util.List;
import java.util.stream.Collectors;

public class PharmacyMapper {

    public static Pharmacy toEntity(PharmacyRequest request) {
        return Pharmacy.builder()
                .pharmacyName(request.getPharmacyName())
                .pharmacyAddress(request.getPharmacyAddress())
                .build();
    }

    public static PharmacyResponse toResponse(Pharmacy pharmacy) {
        return PharmacyResponse.builder()
                .pharmacyId(pharmacy.getPharmacyId())
                .pharmacyName(pharmacy.getPharmacyName())
                .pharmacyAddress(pharmacy.getPharmacyAddress())
                .orderIds(pharmacy.getOrders() == null ? List.of() :
                        pharmacy.getOrders().stream()
                                .map(Order::getOrderId)
                                .collect(Collectors.toList()))
                .build();
    }
}