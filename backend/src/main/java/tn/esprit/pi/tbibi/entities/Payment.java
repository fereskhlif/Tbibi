package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor

@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long paymentId;
    LocalDate paymentDate;
    @Enumerated(EnumType.STRING)
    PaymentMethod paymentMethod;

    @ManyToOne
    PaymentHistory paymenthistory;




    @ManyToOne
    User user;


}
