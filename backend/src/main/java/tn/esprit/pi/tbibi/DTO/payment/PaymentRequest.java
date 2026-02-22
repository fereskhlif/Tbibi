package tn.esprit.pi.tbibi.DTO.payment;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentRequest {
    LocalDate paymentDate;
    String paymentMethod;
    Long paymentHistoryId;
    Long userId;
}