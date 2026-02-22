package tn.esprit.pi.tbibi.mappers;

import tn.esprit.pi.tbibi.DTO.orderline.OrderLineRequest;
import tn.esprit.pi.tbibi.DTO.orderline.OrderLineResponse;
import tn.esprit.pi.tbibi.entities.Medicine;
import tn.esprit.pi.tbibi.entities.OrderLine;

public class OrderLineMapper {

    public static OrderLine toEntity(OrderLineRequest request, Medicine medicine) {
        return OrderLine.builder()
                .quantity(request.getQuantity())
                .unitPrice(request.getUnitPrice())
                .medicine(medicine)
                .build();
    }

    public static OrderLineResponse toResponse(OrderLine orderLine) {
        return OrderLineResponse.builder()
                .lineId(orderLine.getLineId())
                .quantity(orderLine.getQuantity())
                .unitPrice(orderLine.getUnitPrice())
                .medicineId(orderLine.getMedicine().getMedicineId())
                .medicineName(orderLine.getMedicine().getMedicineName())
                .build();
    }
}