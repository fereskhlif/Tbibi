package tn.esprit.pi.tbibi.controllers;

import lombok.AllArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.stereotype.Controller;
import tn.esprit.pi.tbibi.DTO.comment.CommentRequest;
import tn.esprit.pi.tbibi.services.IForumService;

@Controller
@AllArgsConstructor
public class WebSocketController {

    IForumService forumService;

    @MessageMapping("/post/{postId}/comment")
    public void sendComment(@DestinationVariable("postId") Long postId,
                            @Payload CommentRequest request) {
        // ForumService now handles the broadcast + notifications internally
        forumService.addComment(request);
    }
}