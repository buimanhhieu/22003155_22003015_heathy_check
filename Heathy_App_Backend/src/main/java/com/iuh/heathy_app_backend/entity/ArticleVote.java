package com.iuh.heathy_app_backend.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "article_votes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@IdClass(ArticleVoteId.class)
public class ArticleVote {
    @Id
    @ManyToOne @JoinColumn(name = "user_id")
    private User user;

    @Id
    @ManyToOne @JoinColumn(name = "article_id")
    private Article article;
}