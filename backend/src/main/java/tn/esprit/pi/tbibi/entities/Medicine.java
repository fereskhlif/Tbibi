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
@ToString(exclude = {"prescriptions"})
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Medicine {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long medicineId;
    String description;
    String dosage;
    String medicineName;
    Date dateOfExpiration;
    float price;
    int stock;
    int minStockAlert;
    boolean available = true;


    @ElementCollection
    @CollectionTable(name = "medicine_images",
            joinColumns = @JoinColumn(name = "medicine_id"))
    @Column(name = "image_url")
    List<String> imageUrls; //



    @ManyToMany(mappedBy = "medicines")
    List<Prescription> prescriptions;  // Added back-reference
}