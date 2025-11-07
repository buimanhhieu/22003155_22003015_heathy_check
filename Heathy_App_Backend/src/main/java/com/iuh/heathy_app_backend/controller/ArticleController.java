package com.iuh.heathy_app_backend.controller;

import com.iuh.heathy_app_backend.dto.ArticleResponseDTO;
import com.iuh.heathy_app_backend.service.ArticleService;
import com.iuh.heathy_app_backend.service.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/articles")
public class ArticleController {
    
    private final ArticleService articleService;
    
    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }
    
    /**
     * Lấy tất cả articles với tìm kiếm, lọc và sắp xếp
     * GET /api/articles?keyword=...&categoryId=...&sortBy=...
     */
    @GetMapping
    public ResponseEntity<List<ArticleResponseDTO>> getAllArticles(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String sortBy) {
        Long userId = getCurrentUserId();
        List<ArticleResponseDTO> articles = articleService.getAllArticles(userId, keyword, categoryId, sortBy);
        return ResponseEntity.ok(articles);
    }
    
    /**
     * Lấy article theo ID
     * GET /api/articles/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ArticleResponseDTO> getArticleById(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        ArticleResponseDTO article = articleService.getArticleById(id, userId);
        return ResponseEntity.ok(article);
    }
    
    /**
     * Vote article
     * POST /api/articles/{id}/vote
     */
    @PostMapping("/{id}/vote")
    public ResponseEntity<Void> voteArticle(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        articleService.voteArticle(id, userId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Unvote article
     * DELETE /api/articles/{id}/vote
     */
    @DeleteMapping("/{id}/vote")
    public ResponseEntity<Void> unvoteArticle(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        articleService.unvoteArticle(id, userId);
        return ResponseEntity.ok().build();
    }
    
    /**
     * Lấy userId từ SecurityContext
     */
    private Long getCurrentUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && 
                authentication.isAuthenticated() && 
                !authentication.getName().equals("anonymousUser") &&
                authentication.getPrincipal() instanceof UserDetailsImpl) {
                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
                return userDetails.getId();
            }
        } catch (Exception e) {
            // Log error nếu cần
            System.out.println("Error getting current user ID: " + e.getMessage());
        }
        return null; // Trả về null nếu chưa đăng nhập
    }
}

