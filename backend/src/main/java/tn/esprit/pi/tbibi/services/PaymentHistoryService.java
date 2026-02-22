package tn.esprit.pi.tbibi.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.paymenthistory.PaymentHistoryRequest;
import tn.esprit.pi.tbibi.DTO.paymenthistory.PaymentHistoryResponse;
import tn.esprit.pi.tbibi.entities.PaymentHistory;
import tn.esprit.pi.tbibi.mappers.PaymentHistoryMapper;
import tn.esprit.pi.tbibi.repositories.PaymentHistoryRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class PaymentHistoryService implements IPaymentHistoryService {

    PaymentHistoryRepository paymentHistoryRepo;

    @Override
    public PaymentHistoryResponse createPaymentHistory(PaymentHistoryRequest request) {
        PaymentHistory paymentHistory = PaymentHistoryMapper.toEntity(request);
        return PaymentHistoryMapper.toResponse(paymentHistoryRepo.save(paymentHistory));
    }

    @Override
    public PaymentHistoryResponse getPaymentHistoryById(Long id) {
        return PaymentHistoryMapper.toResponse(paymentHistoryRepo.findById(id).orElseThrow());
    }

    @Override
    public List<PaymentHistoryResponse> getAllPaymentHistories() {
        return paymentHistoryRepo.findAll().stream().map(PaymentHistoryMapper::toResponse).toList();
    }

    @Override
    public PaymentHistoryResponse updatePaymentHistory(Long id, PaymentHistoryRequest request) {
        PaymentHistory paymentHistory = paymentHistoryRepo.findById(id).orElseThrow();
        paymentHistory.setAmount(request.getAmount());
        return PaymentHistoryMapper.toResponse(paymentHistoryRepo.save(paymentHistory));
    }

    @Override
    public void deletePaymentHistory(Long id) {
        paymentHistoryRepo.deleteById(id);
    }
}