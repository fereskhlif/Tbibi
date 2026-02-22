package tn.esprit.pi.tbibi.DTO.order;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderRequest {
    Date deliveryDate;
    Date orderDate;
    float totalAmount;
    String orderStatus;
    Long pharmacyId;
    Long userId;
    List<Long> orderLineIds;
}
