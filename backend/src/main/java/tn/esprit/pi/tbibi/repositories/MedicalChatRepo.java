package tn.esprit.pi.tbibi.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.esprit.pi.tbibi.entities.MedicalChat;

import java.util.List;

public interface MedicalChatRepo extends JpaRepository<MedicalChat, Long> {

    // messages of user
    List<MedicalChat> findBySenderUserIdOrReceiverUserId(Integer senderId, Integer receiverId);

    // conversation between 2 users
    List<MedicalChat> findBySenderUserIdAndReceiverUserIdOrReceiverUserIdAndSenderUserIdOrderByCreatedAtAsc(
            Integer senderId, Integer receiverId,
            Integer receiverId2, Integer senderId2
    );

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("UPDATE MedicalChat m SET m.isRead = true, m.readAt = CURRENT_TIMESTAMP WHERE m.sender.userId = :senderId AND m.receiver.userId = :receiverId AND (m.isRead = false OR m.isRead IS NULL)")
    void markMessagesAsRead(@org.springframework.data.repository.query.Param("senderId") Integer senderId, @org.springframework.data.repository.query.Param("receiverId") Integer receiverId);
}