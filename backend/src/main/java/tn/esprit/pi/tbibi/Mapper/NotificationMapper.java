package tn.esprit.pi.tbibi.Mapper;

import org.springframework.stereotype.Component;
import tn.esprit.pi.tbibi.DTO.NotificationDTO;
import tn.esprit.pi.tbibi.entities.Notification;

@Component
public class NotificationMapper {

    public NotificationDTO toDto(Notification entity) {
        NotificationDTO dto = new NotificationDTO();

        dto.setNotificationId(entity.getNotificationId());
        dto.setMessage(entity.getMessage());
        dto.setRead(entity.isRead());
        dto.setCreatedDate(entity.getCreatedDate());

        return dto;
    }

    public Notification toEntity(NotificationDTO dto) {
        Notification entity = new Notification();

        entity.setNotificationId(dto.getNotificationId());
        entity.setMessage(dto.getMessage());
        entity.setRead(dto.isRead());
        entity.setCreatedDate(dto.getCreatedDate());

        return entity;
    }
}
