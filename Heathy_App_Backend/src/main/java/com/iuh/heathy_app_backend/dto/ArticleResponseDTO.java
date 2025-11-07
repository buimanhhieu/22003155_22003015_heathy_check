package com.iuh.heathy_app_backend.dto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class ArticleResponseDTO {
    private Long id;
    private String title;
    private String content;
    private String categoryName;
    private Long categoryId;
    private Integer voteCount;
    private OffsetDateTime publishedAt;
    private Boolean isVoted; // Người dùng đã vote chưa
    
    public ArticleResponseDTO() {}
    
    public ArticleResponseDTO(Long id, String title, String content, String categoryName, 
                             Long categoryId, Integer voteCount, OffsetDateTime publishedAt, Boolean isVoted) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.categoryName = categoryName;
        this.categoryId = categoryId;
        this.voteCount = voteCount;
        this.publishedAt = publishedAt;
        this.isVoted = isVoted;
    }
}

