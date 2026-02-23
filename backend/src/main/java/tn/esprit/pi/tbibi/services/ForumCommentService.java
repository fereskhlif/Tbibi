package tn.esprit.pi.tbibi.services;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.forumcomment.ForumCommentRequest;
import tn.esprit.pi.tbibi.DTO.forumcomment.ForumCommentResponse;
import tn.esprit.pi.tbibi.mappers.ForumCommentMapper;
import tn.esprit.pi.tbibi.entities.ForumComment;
import tn.esprit.pi.tbibi.entities.ForumPost;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.ForumCommentRepository;
import tn.esprit.pi.tbibi.repositories.ForumPostRepository;
import tn.esprit.pi.tbibi.repositories.UserRepository;
import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class ForumCommentService implements IForumCommentService {

    ForumCommentRepository commentRepo;
    ForumPostRepository postRepo;
    UserRepository userRepo;
    ForumCommentMapper commentMapper;

    @Override
    public ForumCommentResponse createComment(ForumCommentRequest request) {
        User author = userRepo.findById(request.getAuthorId()).orElseThrow();
        ForumPost post = postRepo.findById(request.getPostId()).orElseThrow();
        ForumComment comment = commentMapper.toEntity(request);
        comment.setAuthor(author);
        comment.setPost(post);
        comment.setCommentDate(LocalDateTime.now());
        return commentMapper.toDto(commentRepo.save(comment));
    }

    @Override
    public ForumCommentResponse getCommentById(Long id) {
        return commentMapper.toDto(commentRepo.findById(id).orElseThrow());
    }

    @Override
    public ForumCommentResponse updateComment(Long id, ForumCommentRequest request) {
        ForumComment comment = commentRepo.findById(id).orElseThrow();
        comment.setComment(request.getComment());
        return commentMapper.toDto(commentRepo.save(comment));
    }

    @Override
    public void deleteComment(Long id) {
        commentRepo.deleteById(id);
    }
}
