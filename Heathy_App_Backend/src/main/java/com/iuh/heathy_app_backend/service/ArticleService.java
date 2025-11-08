package com.iuh.heathy_app_backend.service;

import com.iuh.heathy_app_backend.dto.ArticleResponseDTO;
import com.iuh.heathy_app_backend.entity.Article;
import com.iuh.heathy_app_backend.entity.ArticleVote;
import com.iuh.heathy_app_backend.entity.User;
import com.iuh.heathy_app_backend.repository.ArticleRepository;
import com.iuh.heathy_app_backend.repository.ArticleVoteRepository;
import com.iuh.heathy_app_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class ArticleService {
    private final ArticleRepository articleRepository;
    private final ArticleVoteRepository articleVoteRepository;
    private final UserRepository userRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String ARTICLES_CACHE_PREFIX = "articles:";
    private static final long ARTICLES_CACHE_TTL = 30; // 30 phút

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
    @SuppressWarnings("unchecked")
    public List<ArticleResponseDTO> getAllArticles(Long userId, String keyword, Long categoryId, String sortBy) {
        // Tạo cache key dựa trên các tham số
        String cacheKey = buildArticlesCacheKey(keyword, categoryId, sortBy);
        
        // Kiểm tra cache
        List<ArticleResponseDTO> cachedArticles = (List<ArticleResponseDTO>) redisTemplate.opsForValue().get(cacheKey);
        
        if (cachedArticles != null) {
            System.out.println("[ArticleService] Cache HIT for articles: " + cacheKey);
            return cachedArticles;
        }
        
        System.out.println("[ArticleService] Cache MISS for articles: " + cacheKey);
        
        // Query từ database
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
        List<ArticleResponseDTO> articleDTOs = articles.stream()
                .map(article -> convertToDTO(article, userId))
                .collect(Collectors.toList());
        
        // Lưu vào cache
        redisTemplate.opsForValue().set(cacheKey, articleDTOs, ARTICLES_CACHE_TTL, TimeUnit.MINUTES);
        
        return articleDTOs;
    }

    /**
     * Lấy article theo ID
     */
    public ArticleResponseDTO getArticleById(Long articleId, Long userId) {
        String cacheKey = ARTICLES_CACHE_PREFIX + "detail:" + articleId + ":user:" + userId;
        
        // Kiểm tra cache
        ArticleResponseDTO cachedArticle = (ArticleResponseDTO) redisTemplate.opsForValue().get(cacheKey);
        if (cachedArticle != null) {
            return cachedArticle;
        }
        
        // Query từ database
        Article article = articleRepository.findByIdWithCategory(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found with id: " + articleId));
        ArticleResponseDTO articleDTO = convertToDTO(article, userId);
        
        // Lưu vào cache
        redisTemplate.opsForValue().set(cacheKey, articleDTO, ARTICLES_CACHE_TTL, TimeUnit.MINUTES);
        
        return articleDTO;
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
        
        // Invalidate cache sau khi vote
        invalidateArticleCache(articleId, userId);
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
        
        // Invalidate cache sau khi unvote
        invalidateArticleCache(articleId, userId);
    }
    
    /**
     * Helper method để tạo cache key
     */
    private String buildArticlesCacheKey(String keyword, Long categoryId, String sortBy) {
        StringBuilder keyBuilder = new StringBuilder(ARTICLES_CACHE_PREFIX);
        
        if (keyword != null && !keyword.trim().isEmpty() && categoryId != null) {
            keyBuilder.append("search:").append(hashString(keyword)).append(":category:").append(categoryId);
        } else if (keyword != null && !keyword.trim().isEmpty()) {
            keyBuilder.append("keyword:").append(hashString(keyword));
        } else if (categoryId != null) {
            keyBuilder.append("category:").append(categoryId);
        } else {
            keyBuilder.append("all");
        }
        
        if (sortBy != null) {
            keyBuilder.append(":sort:").append(sortBy);
        }
        
        return keyBuilder.toString();
    }
    
    /**
     * Hash string để tạo key ngắn gọn hơn
     */
    private String hashString(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString().substring(0, 8); // Lấy 8 ký tự đầu
        } catch (Exception e) {
            return input.replaceAll("[^a-zA-Z0-9]", ""); // Fallback
        }
    }
    
    /**
     * Invalidate cache khi có thay đổi
     */
    private void invalidateArticleCache(Long articleId, Long userId) {
        // Xóa cache của article detail
        String detailKey = ARTICLES_CACHE_PREFIX + "detail:" + articleId + ":user:" + userId;
        redisTemplate.delete(detailKey);
        
        // Xóa tất cả cache của articles list (vì vote count đã thay đổi)
        // Xóa cache "all" và các pattern khác
        redisTemplate.delete(ARTICLES_CACHE_PREFIX + "all");
        // Có thể thêm logic để xóa các cache keys khác nếu cần
        System.out.println("[ArticleService] Article cache invalidated for articleId: " + articleId);
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

