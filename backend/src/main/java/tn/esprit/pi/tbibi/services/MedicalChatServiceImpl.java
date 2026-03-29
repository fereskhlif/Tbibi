package tn.esprit.pi.tbibi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.entities.MedicalChat;
import tn.esprit.pi.tbibi.repositories.MedicalChatRepo;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalChatServiceImpl implements IMedicalChatService {

    private final MedicalChatRepo repo;

    @Override
    public MedicalChat create(MedicalChat chat) {
        return repo.save(chat);
    }

    // all messages of user
    @Override
    public List<MedicalChat> getMessages(Long userId) {
        return repo.findBySenderUserIdOrReceiverUserId(userId, userId);
    }

    // conversation between 2 users
    @Override
    public List<MedicalChat> getConversation(Long senderId, Long receiverId) {
        // Automatically mark messages received by the current user (senderId parameter is often the active user requesting)
        // Wait, to be safe, we will just provide the method and let the controller call it with explicit current user.
        return repo.findBySenderUserIdAndReceiverUserIdOrReceiverUserIdAndSenderUserId(
                senderId, receiverId,
                senderId, receiverId
        );
    }

    @Override
    public void markConversationAsRead(Long senderId, Long receiverId) {
        repo.markMessagesAsRead(senderId, receiverId);
    }
}