package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "Appointement")
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

}
