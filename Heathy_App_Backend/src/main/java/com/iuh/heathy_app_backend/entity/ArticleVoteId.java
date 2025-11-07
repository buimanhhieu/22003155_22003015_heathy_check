package com.iuh.heathy_app_backend.entity;

import lombok.*;
import java.io.Serializable;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class ArticleVoteId implements Serializable {
    private Long user;  // Tên phải khớp với tên field @Id trong ArticleVote
    private Long article; // Tên phải khớp với tên field @Id trong ArticleVote
}