package tn.esprit.pi.tbibi.services;

import java.util.List;
import java.util.Map;

public interface IForumAdminService {
    List<?> getPostsForAdmin(String verdict);
    List<?> getCommentsForAdmin(Long postId);
    Map<String, Object> getToxicityStats();
    Map<String, Object> adminDeletePost(Long postId);
    Map<String, Object> adminDeleteComment(Long commentId);
    Map<String, Object> adminDeleteComments(List<Long> commentIds);
}