package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import tn.esprit.pi.tbibi.DTO.orderline.OrderLineRequest;
import tn.esprit.pi.tbibi.DTO.orderline.OrderLineResponse;
import tn.esprit.pi.tbibi.entities.OrderLine;

@Mapper(componentModel = "spring")
public interface OrderLineMapper {
    OrderLine toEntity(OrderLineRequest request);
    OrderLineResponse toDto(OrderLine orderLine);
}