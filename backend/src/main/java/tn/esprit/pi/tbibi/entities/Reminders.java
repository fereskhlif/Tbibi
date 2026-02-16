package tn.esprit.pi.tbibi.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@ToString
@NoArgsConstructor
@AllArgsConstructor

@FieldDefaults(level = AccessLevel.PRIVATE)

public class Reminders {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long reminderId;
    LocalDateTime reminderDate;
    int frequency;
    @ManyToOne
    Treatment treatment;



    }

