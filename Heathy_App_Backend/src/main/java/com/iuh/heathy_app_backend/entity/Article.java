package com.iuh.heathy_app_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "articles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    private Integer voteCount = 0;

    @Column(name = "published_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime publishedAt = OffsetDateTime.now();

    @OneToMany(mappedBy = "article")
    private List<ArticleVote> votes;
}