package tn.esprit.pi.tbibi.Mapper;

import org.springframework.stereotype.Component;
import tn.esprit.pi.tbibi.DTO.MedicalChatDto;
import tn.esprit.pi.tbibi.entities.MedicalChat;

@Component
public class MedicalChatMapper {

    public MedicalChatDto toDto(MedicalChat entity) {

        MedicalChatDto dto = new MedicalChatDto();

        dto.setId(entity.getId());
        dto.setMessage(entity.getMessage());
        dto.setFileUrl(entity.getFileUrl());
        dto.setIsRead(entity.getIsRead());
        dto.setReadAt(entity.getReadAt());
        dto.setCreatedAt(entity.getCreatedAt());

        if (entity.getSender() != null) {
            dto.setSenderId((long) entity.getSender().getUserId());
        }

        if (entity.getReceiver() != null) {
            dto.setReceiverId((long) entity.getReceiver().getUserId());
        }

        return dto;
    }

    public MedicalChat toEntity(MedicalChatDto dto) {

        MedicalChat entity = new MedicalChat();

        entity.setId(dto.getId());
        entity.setMessage(dto.getMessage());
        entity.setFileUrl(dto.getFileUrl());
        entity.setIsRead(dto.getIsRead());
        entity.setReadAt(dto.getReadAt());
        entity.setCreatedAt(dto.getCreatedAt());

        return entity;
    }
}