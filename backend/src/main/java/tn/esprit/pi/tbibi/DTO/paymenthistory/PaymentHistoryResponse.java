package tn.esprit.pi.tbibi.DTO.paymenthistory;

import lombok.*;
import lombok.experimental.FieldDefaults;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentHistoryResponse {
    Long historyId;
    double amount;
    List<Long> paymentIds;
}