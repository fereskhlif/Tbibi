package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import tn.esprit.pi.tbibi.DTO.payment.PaymentRequest;
import tn.esprit.pi.tbibi.DTO.payment.PaymentResponse;
import tn.esprit.pi.tbibi.entities.Payment;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    Payment toEntity(PaymentRequest request);
    PaymentResponse toDto(Payment payment);
}