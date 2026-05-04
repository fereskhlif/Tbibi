package tn.esprit.pi.tbibi.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.esprit.pi.tbibi.entities.Comment;
import tn.esprit.pi.tbibi.entities.Post;
import tn.esprit.pi.tbibi.repositories.CommentRepository;
import tn.esprit.pi.tbibi.repositories.PostRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumAdminService implements IForumAdminService {

    private final PostRepository    postRepo;
    private final CommentRepository commentRepo;

    // ── READ ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public List<?> getPostsForAdmin(String verdict) {
        List<Post> allPosts = postRepo.findByDeletedFalseOrderByPinnedDescCreatedDateDesc();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Post p : allPosts) {
            double sumScore = 0.0;
            int count = 0;
            
            if (p.getToxicityScore() != null && p.getToxicityScore() >= 0) {
                sumScore += p.getToxicityScore();
                count++;
            }

            if (p.getComments() != null) {
                for (Comment c : p.getComments()) {
                    if (Boolean.FALSE.equals(c.getDeleted()) && c.getToxicityScore() != null && c.getToxicityScore() >= 0) {
                        sumScore += c.getToxicityScore();
                        count++;
                    }
                }
            }

            double finalScore = count > 0 ? (Math.round((sumScore / count) * 100.0) / 100.0) : -1.0;
            String finalVerdict = "UNSCORED";
            if (finalScore >= 0) {
                if (finalScore >= 0.75) finalVerdict = "TOXIC";
                else if (finalScore >= 0.40) finalVerdict = "UNCERTAIN";
                else finalVerdict = "CLEAN";
            }

            if (!"ALL".equalsIgnoreCase(verdict) && !finalVerdict.equalsIgnoreCase(verdict)) {
                continue;
            }

            result.add(Map.of(
                    "postId",          p.getPostId(),
                    "title",           p.getTitle(),
                    "content",         p.getContent() != null ? p.getContent() : "",
                    "authorId",        p.getAuthor() != null ? p.getAuthor().getUserId() : null,
                    "authorName",      p.getAuthor() != null ? p.getAuthor().getName() : "",
                    "createdDate",     p.getCreatedDate() != null ? p.getCreatedDate().toString() : "",
                    "toxicityScore",   finalScore,
                    "toxicityVerdict", finalVerdict,
                    "toxicitySource",  "AGGREGATED"
            ));
        }

        return result;
    }

    @Override
    @Transactional
    public List<?> getCommentsForAdmin(Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postId));

        return commentRepo.findByPostAndDeletedFalseOrderByCommentDateDesc(post)
                .stream().map(c -> Map.of(
                        "commentId",       c.getCommentId(),
                        "comment",         c.getComment() != null ? c.getComment() : "",
                        "authorId",        c.getAuthor() != null ? c.getAuthor().getUserId() : null,
                        "authorName",      c.getAuthor() != null ? c.getAuthor().getName() : "",
                        "commentDate",     c.getCommentDate() != null ? c.getCommentDate().toString() : "",
                        "toxicityScore",   c.getToxicityScore() != null ? c.getToxicityScore() : -1.0,
                        "toxicityVerdict", c.getToxicityVerdict() != null ? c.getToxicityVerdict() : "UNSCORED",
                        "toxicitySource",  c.getToxicitySource() != null ? c.getToxicitySource() : ""
                )).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> getToxicityStats() {
        List<Post> posts = postRepo.findByDeletedFalseOrderByPinnedDescCreatedDateDesc();

        long total = 0;
        long toxic = 0;
        long uncertain = 0;
        long clean = 0;
        long unscored = 0;

        for (Post p : posts) {
            total++;
            double postScore = p.getToxicityScore() != null ? p.getToxicityScore() : -1.0;
            if (postScore >= 0) {
                if (postScore >= 0.75) toxic++;
                else if (postScore >= 0.40) uncertain++;
                else clean++;
            } else {
                unscored++;
            }

            if (p.getComments() != null) {
                for (Comment c : p.getComments()) {
                    if (Boolean.FALSE.equals(c.getDeleted())) {
                        total++;
                        double cScore = c.getToxicityScore() != null ? c.getToxicityScore() : -1.0;
                        if (cScore >= 0) {
                            if (cScore >= 0.75) toxic++;
                            else if (cScore >= 0.40) uncertain++;
                            else clean++;
                        } else {
                            unscored++;
                        }
                    }
                }
            }
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalPosts",   total);
        stats.put("toxic",        toxic);
        stats.put("uncertain",    uncertain);
        stats.put("clean",        clean);
        stats.put("unscored",     unscored);
        stats.put("toxicPercent", total > 0 ? Math.round((toxic * 100.0 / total) * 10.0) / 10.0 : 0);
        return stats;
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public Map<String, Object> adminDeletePost(Long postId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found: " + postId));

        // soft-delete all comments first (consistent with your existing pattern)
        List<Comment> comments = commentRepo.findByPostAndDeletedFalse(post);
        comments.forEach(c -> c.setDeleted(true));
        commentRepo.saveAll(comments);

        // soft-delete the post
        post.setDeleted(true);
        postRepo.save(post);

        return Map.of(
                "message",         "Post and comments removed",
                "postId",          postId,
                "commentsRemoved", comments.size()
        );
    }

    @Override
    @Transactional
    public Map<String, Object> adminDeleteComment(Long commentId) {
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found: " + commentId));

        comment.setDeleted(true);
        commentRepo.save(comment);

        return Map.of(
                "message",   "Comment removed",
                "commentId", commentId
        );
    }

    @Override
    @Transactional
    public Map<String, Object> adminDeleteComments(List<Long> commentIds) {
        if (commentIds == null || commentIds.isEmpty())
            return Map.of("message", "No IDs provided", "deleted", 0);

        List<Comment> found = commentRepo.findAllById(commentIds);
        found.forEach(c -> c.setDeleted(true));
        commentRepo.saveAll(found);

        return Map.of(
                "message",   "Comments removed",
                "requested", commentIds.size(),
                "deleted",   found.size()
        );
    }
}