package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.forumcomment.ForumCommentRequest;
import tn.esprit.pi.tbibi.DTO.forumcomment.ForumCommentResponse;

public interface IForumCommentService {
    ForumCommentResponse createComment(ForumCommentRequest request);
    ForumCommentResponse getCommentById(Long id);
    ForumCommentResponse updateComment(Long id, ForumCommentRequest request);
    void deleteComment(Long id);
}
