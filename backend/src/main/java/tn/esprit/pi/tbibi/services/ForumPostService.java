package tn.esprit.pi.tbibi.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.forumpost.ForumPostRequest;
import tn.esprit.pi.tbibi.DTO.forumpost.ForumPostResponse;
import tn.esprit.pi.tbibi.mappers.ForumPostMapper;
import tn.esprit.pi.tbibi.entities.*;
import tn.esprit.pi.tbibi.repositories.ForumCategoryRepository;
import tn.esprit.pi.tbibi.repositories.ForumPostRepository;
import tn.esprit.pi.tbibi.repositories.UserRepository;
import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class ForumPostService implements IForumPostService {

    ForumPostRepository postRepo;
    ForumCategoryRepository categoryRepo;
    UserRepository userRepo;
    ForumPostMapper postMapper;

    @Override
    public ForumPostResponse createPost(ForumPostRequest request) {
        User author = userRepo.findById(request.getAuthorId()).orElseThrow();
        ForumCategory category = categoryRepo.findById(request.getCategoryId()).orElseThrow();
        ForumPost post = postMapper.toEntity(request);
        post.setAuthor(author);
        post.setCategory(category);
        post.setCreatedDate(LocalDateTime.now());
        post.setViews(0);
        post.setPostStatus(PostStatus.OPEN);
        return postMapper.toDto(postRepo.save(post));
    }

    @Override
    public ForumPostResponse getPostById(Long id) {
        ForumPost post = postRepo.findById(id).orElseThrow();
        post.setViews(post.getViews() + 1);
        return postMapper.toDto(postRepo.save(post));
    }

    @Override
    public List<ForumPostResponse> getAllPosts() {
        return postRepo.findAll().stream().map(postMapper::toDto).toList();
    }

    @Override
    public ForumPostResponse updatePost(Long id, ForumPostRequest request) {
        ForumPost post = postRepo.findById(id).orElseThrow();
        ForumCategory category = categoryRepo.findById(request.getCategoryId()).orElseThrow();
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setPostStatus(PostStatus.valueOf(request.getPostStatus()));
        post.setCategory(category);
        return postMapper.toDto(postRepo.save(post));
    }

    @Override
    public void deletePost(Long id) {
        postRepo.deleteById(id);
    }
}
