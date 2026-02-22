package tn.esprit.pi.tbibi.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.payment.PaymentRequest;
import tn.esprit.pi.tbibi.DTO.payment.PaymentResponse;
import tn.esprit.pi.tbibi.entities.Payment;
import tn.esprit.pi.tbibi.entities.PaymentHistory;
import tn.esprit.pi.tbibi.entities.PaymentMethod;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.mappers.PaymentMapper;
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

    @Override
    public PaymentResponse createPayment(PaymentRequest request) {
        PaymentHistory paymentHistory = paymentHistoryRepo.findById(request.getPaymentHistoryId()).orElseThrow();
        User user = userRepo.findById(request.getUserId()).orElseThrow();
        Payment payment = PaymentMapper.toEntity(request, paymentHistory, user);
        return PaymentMapper.toResponse(paymentRepo.save(payment));
    }

    @Override
    public PaymentResponse getPaymentById(Long id) {
        return PaymentMapper.toResponse(paymentRepo.findById(id).orElseThrow());
    }

    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentRepo.findAll().stream().map(PaymentMapper::toResponse).toList();
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
        return PaymentMapper.toResponse(paymentRepo.save(payment));
    }

    @Override
    public void deletePayment(Long id) {
        paymentRepo.deleteById(id);
    }
}