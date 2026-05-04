package tn.esprit.pi.tbibi.mappers;

import org.springframework.stereotype.Component;
import tn.esprit.pi.tbibi.DTO.relatedpost.RelatedPostDTO;
import tn.esprit.pi.tbibi.entities.Post;

@Component
public class RelatedPostMapper {

    public RelatedPostDTO toDTO(Post post, int relevanceScore) {
        if (post == null) return null;

        return RelatedPostDTO.builder()
                .postId(post.getPostId())
                .title(post.getTitle())
                .authorName(post.getAuthor() != null ? post.getAuthor().getName() : "Unknown")
                .categoryName(post.getCategory() != null ? post.getCategory().getCategoryName() : "")
                .voteCount(post.getVoteCount())
                .commentCount(post.getCommentCount())
                .views(post.getViews())
                .postStatus(post.getPostStatus())
                .createdDate(post.getCreatedDate())
                .relevanceScore(relevanceScore)
                .build();
    }
}