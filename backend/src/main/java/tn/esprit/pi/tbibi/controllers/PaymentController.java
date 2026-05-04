package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.payment.StripePaymentDTO;
import tn.esprit.pi.tbibi.services.IPaymentService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:4200")
@AllArgsConstructor
public class PaymentController {

    private final IPaymentService paymentService;

    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@RequestBody StripePaymentDTO stripeRequest) {
        try {
            String sessionUrl = paymentService.createCheckoutSession(stripeRequest);
            Map<String, String> response = new HashMap<>();
            response.put("sessionUrl", sessionUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}