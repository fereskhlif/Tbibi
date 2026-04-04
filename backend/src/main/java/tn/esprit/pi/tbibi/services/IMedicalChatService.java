package tn.esprit.pi.tbibi.services;


import tn.esprit.pi.tbibi.entities.MedicalChat;

import java.util.List;

public interface IMedicalChatService {

    MedicalChat create(MedicalChat chat);

    List<MedicalChat> getMessages(Integer userId);

    List<MedicalChat> getConversation(Integer senderId, Integer receiverId);

    void markConversationAsRead(Integer senderId, Integer receiverId);
}