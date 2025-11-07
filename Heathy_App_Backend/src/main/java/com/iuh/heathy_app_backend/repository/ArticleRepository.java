package com.iuh.heathy_app_backend.repository;

import com.iuh.heathy_app_backend.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    
    // Lấy 2 bài viết mới nhất
    @Query("SELECT a FROM Article a LEFT JOIN FETCH a.category ORDER BY a.publishedAt DESC")
    List<Article> findTop2ByOrderByPublishedAtDesc();
    
    // Lấy 2 bài viết có nhiều vote nhất
    @Query("SELECT a FROM Article a LEFT JOIN FETCH a.category ORDER BY a.voteCount DESC")
    List<Article> findTop2ByOrderByVoteCountDesc();
    
    // Lấy tất cả articles với category (dùng cho tìm kiếm và lọc)
    @Query("SELECT DISTINCT a FROM Article a LEFT JOIN FETCH a.category")
    List<Article> findAllWithCategory();
    
    // Tìm kiếm articles theo keyword (title hoặc content)
    @Query("SELECT DISTINCT a FROM Article a LEFT JOIN FETCH a.category " +
           "WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Article> searchByKeyword(@Param("keyword") String keyword);
    
    // Lọc articles theo category
    @Query("SELECT DISTINCT a FROM Article a LEFT JOIN FETCH a.category " +
           "WHERE a.category.id = :categoryId")
    List<Article> findByCategoryId(@Param("categoryId") Long categoryId);
    
    // Tìm kiếm và lọc kết hợp
    @Query("SELECT DISTINCT a FROM Article a LEFT JOIN FETCH a.category " +
           "WHERE (:categoryId IS NULL OR a.category.id = :categoryId) " +
           "AND (:keyword IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(a.content) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Article> searchAndFilter(@Param("keyword") String keyword, @Param("categoryId") Long categoryId);
    
    // Lấy article theo ID với category
    @Query("SELECT a FROM Article a LEFT JOIN FETCH a.category WHERE a.id = :id")
    Optional<Article> findByIdWithCategory(@Param("id") Long id);
}

