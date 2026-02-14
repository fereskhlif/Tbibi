package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor

@FieldDefaults(level = AccessLevel.PRIVATE)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long orderId;
    Date deliveryDate;
    float totalAmount;
    @Enumerated(EnumType.STRING)
    Status orderStatus;
    Date orderDate;

    @OneToMany(mappedBy = "order")
    List<OrderLine> orderLines;

    @ManyToOne
    Pharmacy pharmacy;

    @ManyToOne
    User user;
}
