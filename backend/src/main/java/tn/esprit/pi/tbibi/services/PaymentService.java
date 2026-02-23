package tn.esprit.pi.tbibi.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.payment.PaymentRequest;
import tn.esprit.pi.tbibi.DTO.payment.PaymentResponse;
import tn.esprit.pi.tbibi.mappers.PaymentMapper;
import tn.esprit.pi.tbibi.entities.*;
import tn.esprit.pi.tbibi.repositories.PaymentHistoryRepository;
import tn.esprit.pi.tbibi.repositories.PaymentRepository;
import tn.esprit.pi.tbibi.repositories.UserRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class PaymentService implements IPaymentService {

    PaymentRepository paymentRepo;
    PaymentHistoryRepository paymentHistoryRepo;
    UserRepository userRepo;
    PaymentMapper paymentMapper;

    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        PaymentHistory paymentHistory = paymentHistoryRepo.findById(request.getPaymentHistoryId()).orElseThrow();
        User user = userRepo.findById(request.getUserId()).orElseThrow();
        Payment payment = paymentMapper.toEntity(request);
        payment.setPaymenthistory(paymentHistory);
        payment.setUser(user);
        return paymentMapper.toDto(paymentRepo.save(payment));
    }

    @Override
    public PaymentResponse getPaymentById(Long id) {
        return paymentMapper.toDto(paymentRepo.findById(id).orElseThrow());
    }

    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentRepo.findAll().stream().map(paymentMapper::toDto).toList();
    }

    @Override
    public PaymentResponse updatePayment(Long id, PaymentRequest request) {
        Payment payment = paymentRepo.findById(id).orElseThrow();
        PaymentHistory paymentHistory = paymentHistoryRepo.findById(request.getPaymentHistoryId()).orElseThrow();
        User user = userRepo.findById(request.getUserId()).orElseThrow();
        payment.setPaymentDate(request.getPaymentDate());
        payment.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod()));
        payment.setPaymenthistory(paymentHistory);
        payment.setUser(user);
        return paymentMapper.toDto(paymentRepo.save(payment));
    }

    @Override
    public void deletePayment(Long id) {
        paymentRepo.deleteById(id);
    }
}