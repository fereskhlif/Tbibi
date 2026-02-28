package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor

@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderLine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long lineId;
    int quantity;
    float unitPrice;


    @ManyToOne
    Order order;

    @ManyToOne
    @JoinColumn(name = "medicine_id")
    Medicine medicine;
}