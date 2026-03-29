package tn.esprit.pi.tbibi.services;


import tn.esprit.pi.tbibi.entities.MedicalChat;

import java.util.List;

public interface IMedicalChatService {

    MedicalChat create(MedicalChat chat);

    List<MedicalChat> getMessages(Long userId);

    List<MedicalChat> getConversation(Long senderId, Long receiverId);

    void markConversationAsRead(Long senderId, Long receiverId);
}