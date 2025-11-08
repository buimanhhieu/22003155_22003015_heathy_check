package com.iuh.heathy_app_backend.controller;

import com.iuh.heathy_app_backend.dto.CategoryDTO;
import com.iuh.heathy_app_backend.entity.Category;
import com.iuh.heathy_app_backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    
    private final CategoryRepository categoryRepository;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    private static final String CATEGORIES_CACHE_KEY = "categories:all";
    private static final String CATEGORY_CACHE_KEY = "category:";
    private static final long CATEGORIES_CACHE_TTL = 24; // 24 giờ
    
    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    
    /**
     * Lấy tất cả categories
     * GET /api/categories
     */
    @GetMapping
    @SuppressWarnings("unchecked")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        // 1. Kiểm tra cache
        List<CategoryDTO> cachedCategories = (List<CategoryDTO>) redisTemplate.opsForValue().get(CATEGORIES_CACHE_KEY);
        
        if (cachedCategories != null) {
            System.out.println("[CategoryController] Cache HIT for categories");
            return ResponseEntity.ok(cachedCategories);
        }
        
        System.out.println("[CategoryController] Cache MISS for categories");
        
        // 2. Query từ database
        List<Category> categories = categoryRepository.findAll();
        List<CategoryDTO> categoryDTOs = categories.stream()
                .map(category -> new CategoryDTO(category.getId(), category.getName()))
                .collect(Collectors.toList());
        
        // 3. Lưu vào cache
        redisTemplate.opsForValue().set(CATEGORIES_CACHE_KEY, categoryDTOs, CATEGORIES_CACHE_TTL, TimeUnit.HOURS);
        
        return ResponseEntity.ok(categoryDTOs);
    }
    
    /**
     * Lấy category theo ID
     * GET /api/categories/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        String cacheKey = CATEGORY_CACHE_KEY + id;
        
        // Kiểm tra cache
        CategoryDTO cachedCategory = (CategoryDTO) redisTemplate.opsForValue().get(cacheKey);
        if (cachedCategory != null) {
            return ResponseEntity.ok(cachedCategory);
        }
        
        // Query từ database
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        CategoryDTO categoryDTO = new CategoryDTO(category.getId(), category.getName());
        
        // Lưu vào cache
        redisTemplate.opsForValue().set(cacheKey, categoryDTO, CATEGORIES_CACHE_TTL, TimeUnit.HOURS);
        
        return ResponseEntity.ok(categoryDTO);
    }
    
    /**
     * Method để invalidate cache (có thể gọi từ service khi tạo/sửa/xóa category)
     */
    public void invalidateCategoriesCache() {
        // Xóa cache tất cả categories
        redisTemplate.delete(CATEGORIES_CACHE_KEY);
        System.out.println("[CategoryController] Categories cache invalidated");
    }
}

