package tn.esprit.pi.tbibi.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@ToString(exclude = {"orderLines", "prescriptions"})
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long medicineId;
    String medicineName;
    int quantity;
    Date dateOfExpiration;
    float price;
    int stock;

    @OneToMany(mappedBy = "medicine", cascade = CascadeType.ALL)
    List<OrderLine> orderLines;

    @ManyToMany(mappedBy = "medicines")
    @JsonIgnore
    List<Prescription> prescriptions;  // Added back-reference
}