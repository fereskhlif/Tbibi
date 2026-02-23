package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import tn.esprit.pi.tbibi.DTO.paymenthistory.PaymentHistoryRequest;
import tn.esprit.pi.tbibi.DTO.paymenthistory.PaymentHistoryResponse;
import tn.esprit.pi.tbibi.entities.PaymentHistory;

@Mapper(componentModel = "spring")
public interface PaymentHistoryMapper {
    PaymentHistory toEntity(PaymentHistoryRequest request);
    PaymentHistoryResponse toDto(PaymentHistory paymentHistory);
}
