package com.iuh.heathy_app_backend.service;

import com.iuh.heathy_app_backend.dto.ArticleResponseDTO;
import com.iuh.heathy_app_backend.entity.Article;
import com.iuh.heathy_app_backend.entity.ArticleVote;
import com.iuh.heathy_app_backend.entity.User;
import com.iuh.heathy_app_backend.repository.ArticleRepository;
import com.iuh.heathy_app_backend.repository.ArticleVoteRepository;
import com.iuh.heathy_app_backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArticleService {
    private final ArticleRepository articleRepository;
    private final ArticleVoteRepository articleVoteRepository;
    private final UserRepository userRepository;

    public ArticleService(ArticleRepository articleRepository, 
                         ArticleVoteRepository articleVoteRepository,
                         UserRepository userRepository) {
        this.articleRepository = articleRepository;
        this.articleVoteRepository = articleVoteRepository;
        this.userRepository = userRepository;
    }

    /**
     * Lấy tất cả articles với tìm kiếm, lọc và sắp xếp
     */
    public List<ArticleResponseDTO> getAllArticles(Long userId, String keyword, Long categoryId, String sortBy) {
        List<Article> articles;
        
        // Tìm kiếm và lọc
        if (keyword != null && !keyword.trim().isEmpty() && categoryId != null) {
            articles = articleRepository.searchAndFilter(keyword.trim(), categoryId);
        } else if (keyword != null && !keyword.trim().isEmpty()) {
            articles = articleRepository.searchByKeyword(keyword.trim());
        } else if (categoryId != null) {
            articles = articleRepository.findByCategoryId(categoryId);
        } else {
            articles = articleRepository.findAllWithCategory();
        }
        
        // Sắp xếp
        if (sortBy != null) {
            switch (sortBy.toLowerCase()) {
                case "newest":
                    articles.sort((a1, a2) -> a2.getPublishedAt().compareTo(a1.getPublishedAt()));
                    break;
                case "popular":
                case "votes":
                    articles.sort((a1, a2) -> a2.getVoteCount().compareTo(a1.getVoteCount()));
                    break;
                default:
                    articles.sort((a1, a2) -> a2.getPublishedAt().compareTo(a1.getPublishedAt()));
            }
        } else {
            // Mặc định sắp xếp theo mới nhất
            articles.sort((a1, a2) -> a2.getPublishedAt().compareTo(a1.getPublishedAt()));
        }
        
        // Convert to DTO
        return articles.stream()
                .map(article -> convertToDTO(article, userId))
                .collect(Collectors.toList());
    }

    /**
     * Lấy article theo ID
     */
    public ArticleResponseDTO getArticleById(Long articleId, Long userId) {
        Article article = articleRepository.findByIdWithCategory(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found with id: " + articleId));
        return convertToDTO(article, userId);
    }

    /**
     * Vote article
     */
    @Transactional
    public void voteArticle(Long articleId, Long userId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found with id: " + articleId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        
        // Kiểm tra xem đã vote chưa
        if (articleVoteRepository.existsByUserIdAndArticleId(userId, articleId)) {
            throw new RuntimeException("User has already voted for this article");
        }
        
        // Tạo vote mới
        ArticleVote vote = new ArticleVote();
        vote.setUser(user);
        vote.setArticle(article);
        articleVoteRepository.save(vote);
        
        // Tăng voteCount
        article.setVoteCount(article.getVoteCount() + 1);
        articleRepository.save(article);
    }

    /**
     * Unvote article
     */
    @Transactional
    public void unvoteArticle(Long articleId, Long userId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found with id: " + articleId));
        
        // Kiểm tra xem đã vote chưa
        ArticleVote vote = articleVoteRepository.findByUserIdAndArticleId(userId, articleId)
                .orElseThrow(() -> new RuntimeException("User has not voted for this article"));
        
        // Xóa vote
        articleVoteRepository.delete(vote);
        
        // Giảm voteCount
        if (article.getVoteCount() > 0) {
            article.setVoteCount(article.getVoteCount() - 1);
            articleRepository.save(article);
        }
    }

    /**
     * Convert Article entity to ArticleResponseDTO
     */
    private ArticleResponseDTO convertToDTO(Article article, Long userId) {
        ArticleResponseDTO dto = new ArticleResponseDTO();
        dto.setId(article.getId());
        dto.setTitle(article.getTitle());
        dto.setContent(article.getContent());
        dto.setCategoryName(article.getCategory() != null ? article.getCategory().getName() : "Không phân loại");
        dto.setCategoryId(article.getCategory() != null ? article.getCategory().getId() : null);
        dto.setVoteCount(article.getVoteCount());
        dto.setPublishedAt(article.getPublishedAt());
        
        // Kiểm tra xem user đã vote chưa
        if (userId != null) {
            dto.setIsVoted(articleVoteRepository.existsByUserIdAndArticleId(userId, article.getId()));
        } else {
            dto.setIsVoted(false);
        }
        
        return dto;
    }
}

