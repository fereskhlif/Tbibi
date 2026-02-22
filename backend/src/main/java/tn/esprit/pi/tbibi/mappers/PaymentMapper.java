package tn.esprit.pi.tbibi.mappers;

import tn.esprit.pi.tbibi.DTO.payment.PaymentRequest;
import tn.esprit.pi.tbibi.DTO.payment.PaymentResponse;
import tn.esprit.pi.tbibi.entities.Payment;
import tn.esprit.pi.tbibi.entities.PaymentHistory;
import tn.esprit.pi.tbibi.entities.PaymentMethod;
import tn.esprit.pi.tbibi.entities.User;

public class PaymentMapper {

    public static Payment toEntity(PaymentRequest request, PaymentHistory paymentHistory, User user) {
        return Payment.builder()
                .paymentDate(request.getPaymentDate())
                .paymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()))
                .paymenthistory(paymentHistory)
                .user(user)
                .build();
    }

    public static PaymentResponse toResponse(Payment payment) {
        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .paymentDate(payment.getPaymentDate())
                .paymentMethod(String.valueOf(payment.getPaymentMethod()))
                .paymentHistoryId(payment.getPaymenthistory().getHistoryId())
                .userId(payment.getUser().getUserId())
                .build();
    }
}