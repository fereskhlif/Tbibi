package tn.esprit.pi.tbibi.mappers;

import tn.esprit.pi.tbibi.DTO.order.OrderRequest;
import tn.esprit.pi.tbibi.DTO.order.OrderResponse;
import tn.esprit.pi.tbibi.entities.*;

import java.util.List;
import java.util.stream.Collectors;

public class OrderMapper {

    public static Order toEntity(OrderRequest request, Pharmacy pharmacy, User user, List<OrderLine> orderLines) {
        return Order.builder()
                .deliveryDate(request.getDeliveryDate())
                .orderDate(request.getOrderDate())
                .totalAmount(request.getTotalAmount())
                .orderStatus(Status.valueOf(request.getOrderStatus()))
                .pharmacy(pharmacy)
                .user(user)
                .orderLines(orderLines)
                .build();
    }

    public static OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .deliveryDate(order.getDeliveryDate())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .orderStatus(String.valueOf(order.getOrderStatus()))
                .pharmacyId(order.getPharmacy().getPharmacyId())
                .pharmacyName(order.getPharmacy().getPharmacyName())
                .userId(order.getUser().getUserId())
                .orderLines(order.getOrderLines() == null ? List.of() :
                        order.getOrderLines().stream()
                                .map(OrderLineMapper::toResponse)
                                .collect(Collectors.toList()))
                .build();
    }
}