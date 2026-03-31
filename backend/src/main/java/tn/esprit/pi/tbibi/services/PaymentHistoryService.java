package tn.esprit.pi.tbibi.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.paymenthistory.PaymentHistoryRequest;
import tn.esprit.pi.tbibi.DTO.paymenthistory.PaymentHistoryResponse;
import tn.esprit.pi.tbibi.mappers.PaymentHistoryMapper;
import tn.esprit.pi.tbibi.entities.PaymentHistory;
import tn.esprit.pi.tbibi.repositories.PaymentHistoryRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class PaymentHistoryService implements IPaymentHistoryService {

    PaymentHistoryRepository paymentHistoryRepo;
    PaymentHistoryMapper paymentHistoryMapper;

    @Override
    public PaymentHistoryResponse createPaymentHistory(PaymentHistoryRequest request) {
        return paymentHistoryMapper.toDto(paymentHistoryRepo.save(paymentHistoryMapper.toEntity(request)));
    }

    @Override
    public PaymentHistoryResponse getPaymentHistoryById(Long id) {
        return paymentHistoryMapper.toDto(paymentHistoryRepo.findById(id).orElseThrow());
    }

    @Override
    public List<PaymentHistoryResponse> getAllPaymentHistories() {
        return paymentHistoryRepo.findAll().stream().map(paymentHistoryMapper::toDto).toList();
    }

    @Override
    public PaymentHistoryResponse updatePaymentHistory(Long id, PaymentHistoryRequest request) {
        PaymentHistory paymentHistory = paymentHistoryRepo.findById(id).orElseThrow();
        paymentHistory.setAmount(request.getAmount());
        return paymentHistoryMapper.toDto(paymentHistoryRepo.save(paymentHistory));
    }

    @Override
    public void deletePaymentHistory(Long id) {
        paymentHistoryRepo.deleteById(id);
    }
}