package tn.esprit.pi.tbibi.DTO.order;

import lombok.*;
import lombok.experimental.FieldDefaults;
import tn.esprit.pi.tbibi.DTO.orderline.OrderLineRequest;

import java.util.Date;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderRequest {
    Long pharmacyId;
    Integer userId;
    List<OrderLineRequest> orderLines;
}
