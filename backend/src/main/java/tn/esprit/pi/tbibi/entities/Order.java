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
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"orderLines", "pharmacy", "user"})  // Exclude relationships
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long orderId;
    Date deliveryDate;
    float totalAmount;

    @Enumerated(EnumType.STRING)
    Status orderStatus;
    Date orderDate;

    @ManyToMany
    @JoinTable(
            name = "order_orderline",
            joinColumns = @JoinColumn(name = "order_id"),
            inverseJoinColumns = @JoinColumn(name = "orderline_id")
    )
    List<OrderLine> orderLines;

    @ManyToOne
    Pharmacy pharmacy;

    @ManyToOne
    User user;
}