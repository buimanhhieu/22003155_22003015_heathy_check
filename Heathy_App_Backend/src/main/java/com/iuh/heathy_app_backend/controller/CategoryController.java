package com.iuh.heathy_app_backend.controller;

import com.iuh.heathy_app_backend.dto.CategoryDTO;
import com.iuh.heathy_app_backend.entity.Category;
import com.iuh.heathy_app_backend.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    
    private final CategoryRepository categoryRepository;
    
    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    
    /**
     * Lấy tất cả categories
     * GET /api/categories
     */
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryDTO> categoryDTOs = categories.stream()
                .map(category -> new CategoryDTO(category.getId(), category.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(categoryDTOs);
    }
    
    /**
     * Lấy category theo ID
     * GET /api/categories/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        CategoryDTO categoryDTO = new CategoryDTO(category.getId(), category.getName());
        return ResponseEntity.ok(categoryDTO);
    }
}

