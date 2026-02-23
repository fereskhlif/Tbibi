package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;



@AllArgsConstructor
@Entity
@Getter
@Setter
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ForumCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long categoryId;
    String categoryName;
    String categoryDescription;
}
