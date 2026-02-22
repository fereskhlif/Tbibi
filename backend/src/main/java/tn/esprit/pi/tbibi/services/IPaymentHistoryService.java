package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.paymenthistory.PaymentHistoryRequest;
import tn.esprit.pi.tbibi.DTO.paymenthistory.PaymentHistoryResponse;

import java.util.List;

public interface IPaymentHistoryService {
    PaymentHistoryResponse createPaymentHistory(PaymentHistoryRequest request);
    PaymentHistoryResponse getPaymentHistoryById(Long id);
    List<PaymentHistoryResponse> getAllPaymentHistories();
    PaymentHistoryResponse updatePaymentHistory(Long id, PaymentHistoryRequest request);
    void deletePaymentHistory(Long id);
}
