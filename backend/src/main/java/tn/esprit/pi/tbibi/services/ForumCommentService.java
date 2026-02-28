package tn.esprit.pi.tbibi.services;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.DTO.forumcomment.ForumCommentRequest;
import tn.esprit.pi.tbibi.DTO.forumcomment.ForumCommentResponse;
import tn.esprit.pi.tbibi.entities.Notification;
import tn.esprit.pi.tbibi.mappers.ForumCommentMapper;
import tn.esprit.pi.tbibi.entities.ForumComment;
import tn.esprit.pi.tbibi.entities.ForumPost;
import tn.esprit.pi.tbibi.entities.User;
import tn.esprit.pi.tbibi.repositories.ForumCommentRepository;
import tn.esprit.pi.tbibi.repositories.NotificationRepository;
import tn.esprit.pi.tbibi.repositories.ForumPostRepository;
import tn.esprit.pi.tbibi.repositories.UserRepo;
import java.time.LocalDateTime;

@Service
@AllArgsConstructor
public class ForumCommentService implements IForumCommentService {

    ForumCommentRepository commentRepo;
    ForumPostRepository postRepo;
    UserRepo userRepo;
    ForumCommentMapper commentMapper;
    NotificationRepository notificationRepo;

    //Notification logic :
    @Override
    public ForumCommentResponse createComment(ForumCommentRequest request) {
        User author = userRepo.findById(request.getAuthorId()).orElseThrow();
        ForumPost post = postRepo.findById(request.getPostId()).orElseThrow();
        ForumComment comment = commentMapper.toEntity(request);
        comment.setAuthor(author);
        comment.setPost(post);

        comment.setCommentDate(LocalDateTime.now());
        commentRepo.save(comment);

        // ── Create notification automatically ──────────────────
        if (!post.getAuthor().getUserId().equals(request.getAuthorId())) {
            // only notify if commenter is not the post author himself
            Notification notification = new Notification();
            notification.setMessage(author.getName() + " commented on your post: " + post.getTitle());
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notification.setRecipient(post.getAuthor());

            notificationRepo.save(notification);
        }

        return commentMapper.toDto(comment);
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

    }
    //@Transactional
    //@Override
    //public void deleteComment(Long id) {
        // ← delete notifications linked to this comment first
        //notificationRepo.deleteByComment_CommentId(id);
        //commentRepo.deleteById(id);
    //}
}
