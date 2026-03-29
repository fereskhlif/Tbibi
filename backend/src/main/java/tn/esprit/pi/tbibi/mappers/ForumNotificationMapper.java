package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import tn.esprit.pi.tbibi.DTO.notification.NotificationResponse;
import tn.esprit.pi.tbibi.entities.Notification;

@Mapper(componentModel = "spring")
public interface ForumNotificationMapper {

    @Mapping(source = "recipient.userId", target = "recipientId")

    NotificationResponse toDto(Notification notification);
}