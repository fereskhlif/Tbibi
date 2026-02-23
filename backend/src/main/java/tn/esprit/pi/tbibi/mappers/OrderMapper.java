package tn.esprit.pi.tbibi.mappers;

import tn.esprit.pi.tbibi.DTO.order.OrderRequest;
import tn.esprit.pi.tbibi.DTO.order.OrderResponse;
import org.mapstruct.Mapper;
import tn.esprit.pi.tbibi.entities.Order;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    Order toEntity(OrderRequest request);
    OrderResponse toDto(Order order);
}