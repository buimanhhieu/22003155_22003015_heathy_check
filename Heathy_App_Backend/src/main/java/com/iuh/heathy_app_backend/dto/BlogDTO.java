package com.iuh.heathy_app_backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BlogDTO {
    private Long id;
    private String title;
    private String categoryName;
    private int voteCount;
    private LocalDateTime publishedAt;
}


















