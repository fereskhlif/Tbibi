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
    public List<MedicalChat> getMessages(Integer userId) {
        return repo.findBySenderUserIdOrReceiverUserId(userId, userId);
    }

    // conversation between 2 users
    @Override
    public List<MedicalChat> getConversation(Integer senderId, Integer receiverId) {
        // Find messages where (Sender=senderId AND Receiver=receiverId) 
        // OR (Receiver=senderId AND Sender=receiverId)
        return repo.findBySenderUserIdAndReceiverUserIdOrReceiverUserIdAndSenderUserIdOrderByCreatedAtAsc(
                senderId, receiverId,
                senderId, receiverId
        );
    }

    @Override
    public void markConversationAsRead(Integer senderId, Integer receiverId) {
        repo.markMessagesAsRead(senderId, receiverId);
    }
}