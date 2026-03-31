package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.payment.PaymentRequest;
import tn.esprit.pi.tbibi.DTO.payment.PaymentResponse;

import java.util.List;

public interface IPaymentService {
    PaymentResponse createPayment(PaymentRequest request);
    PaymentResponse getPaymentById(Long id);
    List<PaymentResponse> getAllPayments();
    PaymentResponse updatePayment(Long id, PaymentRequest request);
    void deletePayment(Long id);
}