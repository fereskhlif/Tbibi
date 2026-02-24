package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Entity
@Table(name = "Ia_history")
@Getter
@Setter
@ToString
@EqualsAndHashCode
@NoArgsConstructor //
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Ia_history {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long hitoryId;
    private String VocaleUser;
    private String textUser;
    private String imageUser;

    private String VocaleChatbot;
    private String textChatbot;
    private String imageChatbot;
    @OneToMany(cascade = CascadeType.ALL)
    private Set<Laboratory_Result> Laboratory_Results;

}
