package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.paymenthistory.PaymentHistoryRequest;
import tn.esprit.pi.tbibi.DTO.paymenthistory.PaymentHistoryResponse;
import tn.esprit.pi.tbibi.services.IPaymentHistoryService;

import java.util.List;

@RestController
@RequestMapping("/api/payment-histories")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class PaymentHistoryController {

    IPaymentHistoryService paymentHistoryService;

    @PostMapping
    public PaymentHistoryResponse create(@RequestBody PaymentHistoryRequest request) {
        return paymentHistoryService.createPaymentHistory(request);
    }

    @GetMapping("/{id}")
    public PaymentHistoryResponse getById(@PathVariable Long id) {
        return paymentHistoryService.getPaymentHistoryById(id);
    }

    @GetMapping
    public List<PaymentHistoryResponse> getAll() {
        return paymentHistoryService.getAllPaymentHistories();
    }

    @PutMapping("/{id}")
    public PaymentHistoryResponse update(@PathVariable Long id, @RequestBody PaymentHistoryRequest request) {
        return paymentHistoryService.updatePaymentHistory(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        paymentHistoryService.deletePaymentHistory(id);
    }
}
