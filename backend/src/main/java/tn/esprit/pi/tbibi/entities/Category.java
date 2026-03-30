package tn.esprit.pi.tbibi.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import tn.esprit.pi.tbibi.entities.Post;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"posts"})
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long categoryId;

    String categoryName;
    String categoryDescription;
    LocalDateTime createdAt;

    @Column(name = "is_active", nullable = false)
    Boolean active = true;

    public Boolean getActive() {
        return active;
    }

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "category")
    @JsonIgnore
    List<Post> posts;
}