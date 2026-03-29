package tn.esprit.pi.tbibi.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import tn.esprit.pi.tbibi.DTO.MedicalChatDto;
import tn.esprit.pi.tbibi.Mapper.MedicalChatMapper;
import tn.esprit.pi.tbibi.entities.MedicalChat;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.UserRepo;
import tn.esprit.pi.tbibi.services.IMedicalChatService;

import java.time.LocalDateTime;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final IMedicalChatService chatService;
    private final MedicalChatMapper mapper;
    private final UserRepo userRepo;

    /**
     * Reçoit le message via STOMP, le persiste en BDD et l'envoie au destinataire et à l'expéditeur.
     */
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload MedicalChatDto dto) {
        
        MedicalChat chat = mapper.toEntity(dto);

        User sender = userRepo.findById(dto.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepo.findById(dto.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        chat.setSender(sender);
        chat.setReceiver(receiver);
        chat.setCreatedAt(LocalDateTime.now());
        chat.setIsRead(false);
        // File URL is already mapped if provided

        MedicalChat savedMsg = chatService.create(chat);
        MedicalChatDto savedDto = mapper.toDto(savedMsg);

        // Envoyer au destinataire
        messagingTemplate.convertAndSend("/topic/messages/" + savedDto.getReceiverId(), savedDto);
        // Envoyer aussi à l'expéditeur (pour confirmer l'envoi et avoir l'ID généré)
        messagingTemplate.convertAndSend("/topic/messages/" + savedDto.getSenderId(), savedDto);
    }

    /**
     * Gère l'indicateur "est en train d'écrire..."
     * Le DTO envoyé peut juste contenir senderId, receiverId, et un message genre "typing" ou "stopped"
     */
    @MessageMapping("/chat.typing")
    public void typingSupport(@Payload MedicalChatDto typingEvent) {
        messagingTemplate.convertAndSend("/topic/typing/" + typingEvent.getReceiverId(), typingEvent);
    }
}
