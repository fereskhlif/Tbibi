package tn.esprit.pi.tbibi.services;

import tn.esprit.pi.tbibi.DTO.forumpost.ForumPostRequest;
import tn.esprit.pi.tbibi.DTO.forumpost.ForumPostResponse;
import java.util.List;

public interface IForumPostService {
    ForumPostResponse createPost(ForumPostRequest request);
    ForumPostResponse getPostById(Long id);
    List<ForumPostResponse> getAllPosts();
    ForumPostResponse updatePost(Long id, ForumPostRequest request);
    void deletePost(Long id);
}
