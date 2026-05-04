package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.payment.PaymentRequest;
import tn.esprit.pi.tbibi.DTO.payment.PaymentResponse;
import tn.esprit.pi.tbibi.mappers.PaymentMapper;
import tn.esprit.pi.tbibi.entities.*;
import tn.esprit.pi.tbibi.repositories.PaymentHistoryRepository;
import tn.esprit.pi.tbibi.repositories.PaymentRepository;
import tn.esprit.pi.tbibi.repositories.UserRepo;

import tn.esprit.pi.tbibi.DTO.payment.StripePaymentDTO;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService implements IPaymentService {

    private final PaymentRepository paymentRepo;
    private final PaymentHistoryRepository paymentHistoryRepo;
    private final UserRepo userRepo;
    private final PaymentMapper paymentMapper;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

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

    public String createCheckoutSession(StripePaymentDTO stripeRequest) throws Exception {
        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(stripeRequest.getSuccessUrl() + "?session_id={CHECKOUT_SESSION_ID}&orderId=" + stripeRequest.getOrderId())
                .setCancelUrl(stripeRequest.getCancelUrl())
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(stripeRequest.getCurrency())
                                                .setUnitAmount(stripeRequest.getAmount())
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(stripeRequest.getProductName())
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .build();

        Session session = Session.create(params);
        return session.getUrl();
    }
}