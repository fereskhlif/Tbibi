package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapping;
import tn.esprit.pi.tbibi.DTO.order.OrderRequest;
import tn.esprit.pi.tbibi.DTO.order.OrderResponse;
import org.mapstruct.Mapper;
import tn.esprit.pi.tbibi.entities.Order;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    Order toEntity(OrderRequest request);

    @Mapping(source = "pharmacy.pharmacyId", target = "pharmacyId")
    @Mapping(source = "pharmacy.pharmacyName", target = "pharmacyName")
    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "user.name", target = "userName")
    @Mapping(source = "orderStatus", target = "orderStatus")
    OrderResponse toDto(Order order);
}