package tn.esprit.pi.tbibi.controllers;


import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.esprit.pi.tbibi.DTO.MedicalChatDto;
import tn.esprit.pi.tbibi.Mapper.MedicalChatMapper;
import tn.esprit.pi.tbibi.entities.MedicalChat;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.UserRepo;
import tn.esprit.pi.tbibi.services.IMedicalChatService;
import tn.esprit.pi.tbibi.services.MedicalChatServiceImpl ;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/medical-chat")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class MedicalChatController {

    private final IMedicalChatService service;
    private final MedicalChatMapper  mapper;
    private final UserRepo userRepo;

    // SEND MESSAGE 🔥
    @PostMapping("/send")
    public MedicalChatDto send(@RequestBody MedicalChatDto dto) {

        MedicalChat chat = mapper.toEntity(dto);

        User sender = userRepo.findById(dto.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User receiver = userRepo.findById(dto.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        chat.setSender(sender);
        chat.setReceiver(receiver);
        chat.setCreatedAt(LocalDateTime.now());

        return mapper.toDto(service.create(chat));
    }

    // ALL messages of user
    @GetMapping("/user/{id}")
    public List<MedicalChatDto> getUserMessages(@PathVariable Long id) {
        return service.getMessages(id)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    // conversation between 2 users
    @GetMapping("/conversation")
    public List<MedicalChatDto> getConversation(
            @RequestParam Long senderId,
            @RequestParam Long receiverId) {

        // also mark them as read when fetching conversation
        service.markConversationAsRead(receiverId, senderId);

        return service.getConversation(senderId, receiverId)
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    // UPLOAD ATTACHMENT
    @PostMapping("/upload")
    public java.util.Map<String, String> uploadFile(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            java.io.File uploadDir = new java.io.File("uploads/chat-images");
            if (!uploadDir.exists()) uploadDir.mkdirs();

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
            java.nio.file.Path path = java.nio.file.Paths.get("uploads/chat-images/" + fileName);
            java.nio.file.Files.write(path, file.getBytes());

            String fileUrl = "http://localhost:8088/uploads/chat-images/" + fileName;
            return java.util.Map.of("fileUrl", fileUrl);
        } catch (Exception e) {
            throw new RuntimeException("Could not store the file. Error: " + e.getMessage());
        }
    }
}