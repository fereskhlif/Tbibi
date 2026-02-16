package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Entity
@Getter
@Setter
@Builder
@ToString(exclude = "orders")  // Exclude to prevent circular reference
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Pharmacy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long pharmacyId;
    String pharmacyName;
    String pharmacyAddress;

    @OneToMany(mappedBy = "pharmacy")
    List<Order> orders;
}