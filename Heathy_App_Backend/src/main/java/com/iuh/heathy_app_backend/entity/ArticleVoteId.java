package com.iuh.heathy_app_backend.entity;

import lombok.*;
import java.io.Serializable;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class ArticleVoteId implements Serializable {
    private Long user;
    private Long article;
}