package tn.esprit.pi.tbibi.DTO.order;

import lombok.*;
import lombok.experimental.FieldDefaults;
import tn.esprit.pi.tbibi.DTO.orderline.OrderLineResponse;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    Long orderId;
    Date deliveryDate;
    Date orderDate;
    float totalAmount;
    String orderStatus;
    Long pharmacyId;
    String pharmacyName;
    Long userId;
    List<OrderLineResponse> orderLines;
}