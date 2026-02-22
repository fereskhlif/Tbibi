package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.payment.PaymentRequest;
import tn.esprit.pi.tbibi.DTO.payment.PaymentResponse;
import tn.esprit.pi.tbibi.services.IPaymentService;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class PaymentController {

    IPaymentService paymentService;

    @PostMapping
    public PaymentResponse create(@RequestBody PaymentRequest request) {
        return paymentService.createPayment(request);
    }

    @GetMapping("/{id}")
    public PaymentResponse getById(@PathVariable Long id) {
        return paymentService.getPaymentById(id);
    }

    @GetMapping
    public List<PaymentResponse> getAll() {
        return paymentService.getAllPayments();
    }

    @PutMapping("/{id}")
    public PaymentResponse update(@PathVariable Long id, @RequestBody PaymentRequest request) {
        return paymentService.updatePayment(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        paymentService.deletePayment(id);
    }
}