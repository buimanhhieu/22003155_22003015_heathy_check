package com.iuh.heathy_app_backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.iuh.heathy_app_backend.dto.ArticleResponseDTO;
import com.iuh.heathy_app_backend.entity.Article;
import com.iuh.heathy_app_backend.entity.ArticleVote;
import com.iuh.heathy_app_backend.entity.Category;
import com.iuh.heathy_app_backend.entity.User;
import com.iuh.heathy_app_backend.repository.ArticleRepository;
import com.iuh.heathy_app_backend.repository.ArticleVoteRepository;
import com.iuh.heathy_app_backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.lang.reflect.Field;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Test cases dựa trên ARTIC-LE-001 đến ARTIC-LE-006
 */
@ExtendWith(MockitoExtension.class)
class ArticleServiceTest {

    @Mock
    private ArticleRepository articleRepository;
    
    @Mock
    private ArticleVoteRepository articleVoteRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private RedisTemplate<String, Object> redisTemplate;
    
    @Mock
    private ObjectMapper objectMapper;
    
    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private ArticleService articleService;

    private User testUser;
    private Article testArticle;
    private Category testCategory;
    private Long userId = 1L;
    private Long articleId = 1L;

    @BeforeEach
    void setUp() throws Exception {
        testUser = new User();
        testUser.setId(userId);
        testUser.setEmail("test@example.com");
        testUser.setFullName("Test User");
        
        testCategory = new Category();
        testCategory.setId(1L);
        testCategory.setName("Dinh dưỡng");
        
        testArticle = new Article();
        testArticle.setId(articleId);
        testArticle.setTitle("Bài viết về dinh dưỡng");
        testArticle.setContent("Nội dung bài viết");
        testArticle.setCategory(testCategory);
        testArticle.setVoteCount(5);
        testArticle.setPublishedAt(OffsetDateTime.now());
        
        // Inject @Autowired fields using reflection
        setField(articleService, "redisTemplate", redisTemplate);
        setField(articleService, "objectMapper", objectMapper);
        
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(redisTemplate.delete(anyString())).thenReturn(true);
    }
    
    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    // ARTIC-LE-001: Get Article List
    @Test
    void testGetAllArticles_Success() {
        // Arrange
        String sortBy = "newest";
        when(valueOperations.get(anyString())).thenReturn(null); // Cache miss
        when(articleRepository.findAllWithCategory()).thenReturn(Arrays.asList(testArticle));
        when(articleVoteRepository.existsByUserIdAndArticleId(userId, articleId)).thenReturn(false);
        
        // Act
        List<ArticleResponseDTO> result = articleService.getAllArticles(userId, null, null, sortBy);
        
        // Assert
        assertNotNull(result);
        verify(articleRepository, times(1)).findAllWithCategory();
        verify(redisTemplate.opsForValue(), times(1)).set(anyString(), any(), eq(30L), any());
    }

    // ARTIC-LE-002: Filter by Category
    @Test
    void testGetAllArticles_FilterByCategory() {
        // Arrange
        Long categoryId = 1L;
        when(valueOperations.get(anyString())).thenReturn(null); // Cache miss
        when(articleRepository.findByCategoryId(categoryId)).thenReturn(Arrays.asList(testArticle));
        when(articleVoteRepository.existsByUserIdAndArticleId(userId, articleId)).thenReturn(false);
        
        // Act
        List<ArticleResponseDTO> result = articleService.getAllArticles(userId, null, categoryId, null);
        
        // Assert
        assertNotNull(result);
        verify(articleRepository, times(1)).findByCategoryId(categoryId);
    }

    // ARTIC-LE-003: Search Articles (Frontend filters, but service can search too)
    @Test
    void testGetAllArticles_SearchByKeyword() {
        // Arrange
        String keyword = "dinh dưỡng";
        when(valueOperations.get(anyString())).thenReturn(null); // Cache miss
        when(articleRepository.searchByKeyword(keyword)).thenReturn(Arrays.asList(testArticle));
        when(articleVoteRepository.existsByUserIdAndArticleId(userId, articleId)).thenReturn(false);
        
        // Act
        List<ArticleResponseDTO> result = articleService.getAllArticles(userId, keyword, null, null);
        
        // Assert
        assertNotNull(result);
        verify(articleRepository, times(1)).searchByKeyword(keyword);
    }

    // ARTIC-LE-004: Vote Article
    @Test
    void testVoteArticle_Success() {
        // Arrange
        when(articleRepository.findById(articleId)).thenReturn(Optional.of(testArticle));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(articleVoteRepository.existsByUserIdAndArticleId(userId, articleId)).thenReturn(false);
        when(articleVoteRepository.save(any(ArticleVote.class))).thenAnswer(invocation -> {
            ArticleVote vote = invocation.getArgument(0);
            vote.setArticle(testArticle);
            vote.setUser(testUser);
            return vote;
        });
        when(articleRepository.save(any(Article.class))).thenAnswer(invocation -> {
            Article saved = invocation.getArgument(0);
            saved.setVoteCount(6); // Increased from 5
            return saved;
        });
        
        // Act
        assertDoesNotThrow(() -> articleService.voteArticle(articleId, userId));
        
        // Assert
        verify(articleVoteRepository, times(1)).save(any(ArticleVote.class));
        verify(articleRepository, times(1)).save(any(Article.class));
        verify(redisTemplate, atLeastOnce()).delete(anyString());
    }

    // ARTIC-LE-004: Vote Article - Already Voted
    @Test
    void testVoteArticle_AlreadyVoted() {
        // Arrange
        when(articleRepository.findById(articleId)).thenReturn(Optional.of(testArticle));
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(articleVoteRepository.existsByUserIdAndArticleId(userId, articleId)).thenReturn(true);
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            articleService.voteArticle(articleId, userId);
        });
        
        assertEquals("User has already voted for this article", exception.getMessage());
        verify(articleVoteRepository, never()).save(any(ArticleVote.class));
    }

    // ARTIC-LE-005: Unvote Article
    @Test
    void testUnvoteArticle_Success() {
        // Arrange
        ArticleVote vote = new ArticleVote();
        vote.setUser(testUser);
        vote.setArticle(testArticle);
        
        when(articleRepository.findById(articleId)).thenReturn(Optional.of(testArticle));
        when(articleVoteRepository.findByUserIdAndArticleId(userId, articleId)).thenReturn(Optional.of(vote));
        when(articleRepository.save(any(Article.class))).thenAnswer(invocation -> {
            Article saved = invocation.getArgument(0);
            saved.setVoteCount(4); // Decreased from 5
            return saved;
        });
        
        // Act
        assertDoesNotThrow(() -> articleService.unvoteArticle(articleId, userId));
        
        // Assert
        verify(articleVoteRepository, times(1)).delete(vote);
        verify(articleRepository, times(1)).save(any(Article.class));
        verify(redisTemplate, atLeastOnce()).delete(anyString());
    }

    // ARTIC-LE-005: Unvote Article - Not Voted
    @Test
    void testUnvoteArticle_NotVoted() {
        // Arrange
        when(articleRepository.findById(articleId)).thenReturn(Optional.of(testArticle));
        when(articleVoteRepository.findByUserIdAndArticleId(userId, articleId)).thenReturn(Optional.empty());
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            articleService.unvoteArticle(articleId, userId);
        });
        
        assertEquals("User has not voted for this article", exception.getMessage());
        verify(articleVoteRepository, never()).delete(any(ArticleVote.class));
    }

    // ARTIC-LE-006: View Article Details
    @Test
    void testGetArticleById_Success() {
        // Arrange
        when(valueOperations.get(anyString())).thenReturn(null); // Cache miss
        when(articleRepository.findByIdWithCategory(articleId)).thenReturn(Optional.of(testArticle));
        when(articleVoteRepository.existsByUserIdAndArticleId(userId, articleId)).thenReturn(false);
        
        // Act
        ArticleResponseDTO result = articleService.getArticleById(articleId, userId);
        
        // Assert
        assertNotNull(result);
        assertEquals(articleId, result.getId());
        assertEquals(testArticle.getTitle(), result.getTitle());
        verify(articleRepository, times(1)).findByIdWithCategory(articleId);
    }

    @Test
    void testGetArticleById_NotFound() {
        // Arrange
        when(valueOperations.get(anyString())).thenReturn(null); // Cache miss
        when(articleRepository.findByIdWithCategory(articleId)).thenReturn(Optional.empty());
        
        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            articleService.getArticleById(articleId, userId);
        });
        
        assertEquals("Article not found with id: " + articleId, exception.getMessage());
    }
}

