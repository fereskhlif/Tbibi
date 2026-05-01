package tn.esprit.pi.tbibi.DTO.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicinePurchaseHistoryDTO {
    private Long orderId;
    private String medicineName;
    private Date orderDate;
    private Integer quantity;
    private Float unitPrice;
    private String pharmacyName;
}
