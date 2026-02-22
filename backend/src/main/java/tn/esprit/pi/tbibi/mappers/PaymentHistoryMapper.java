package tn.esprit.pi.tbibi.mappers;

import tn.esprit.pi.tbibi.DTO.paymenthistory.PaymentHistoryRequest;
import tn.esprit.pi.tbibi.DTO.paymenthistory.PaymentHistoryResponse;
import tn.esprit.pi.tbibi.entities.Payment;
import tn.esprit.pi.tbibi.entities.PaymentHistory;

import java.util.List;
import java.util.stream.Collectors;

public class PaymentHistoryMapper {

    public static PaymentHistory toEntity(PaymentHistoryRequest request) {
        return PaymentHistory.builder()
                .amount(request.getAmount())
                .build();
    }

    public static PaymentHistoryResponse toResponse(PaymentHistory paymentHistory) {
        return PaymentHistoryResponse.builder()
                .historyId(paymentHistory.getHistoryId())
                .amount(paymentHistory.getAmount())
                .paymentIds(paymentHistory.getPayments() == null ? List.of() :
                        paymentHistory.getPayments().stream()
                                .map(Payment::getPaymentId)
                                .collect(Collectors.toList()))
                .build();
    }
}