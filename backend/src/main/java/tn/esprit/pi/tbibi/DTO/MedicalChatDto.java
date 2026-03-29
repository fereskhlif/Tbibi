package tn.esprit.pi.tbibi.DTO;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MedicalChatDto {

    private Long id;
    private String message;

    private Long senderId;
    private Long receiverId;

    private String fileUrl;
    private Boolean isRead;
    private java.time.LocalDateTime readAt;
    private java.time.LocalDateTime createdAt;
}
