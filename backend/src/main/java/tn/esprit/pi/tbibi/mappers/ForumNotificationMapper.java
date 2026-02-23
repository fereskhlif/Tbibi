package tn.esprit.pi.tbibi.mappers;

import org.mapstruct.Mapper;
import tn.esprit.pi.tbibi.DTO.forumnotification.ForumNotificationResponse;
import tn.esprit.pi.tbibi.entities.ForumNotification;

@Mapper(componentModel = "spring")
public interface ForumNotificationMapper {
    ForumNotificationResponse toDto(ForumNotification notification);
}