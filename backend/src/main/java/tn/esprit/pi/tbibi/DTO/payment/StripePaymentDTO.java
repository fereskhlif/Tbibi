package tn.esprit.pi.tbibi.DTO.payment;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StripePaymentDTO {
    private Long amount; // In cents
    private String currency;
    private String productName;
    private String successUrl;
    private String cancelUrl;
    private Long orderId; // To link the payment
}
