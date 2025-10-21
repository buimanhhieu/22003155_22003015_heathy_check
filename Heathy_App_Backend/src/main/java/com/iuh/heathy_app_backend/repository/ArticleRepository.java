package com.iuh.heathy_app_backend.repository;

import com.iuh.heathy_app_backend.entity.Article;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    
    // Lấy 2 bài viết mới nhất
    @Query("SELECT a FROM Article a LEFT JOIN FETCH a.category ORDER BY a.publishedAt DESC")
    List<Article> findTop2ByOrderByPublishedAtDesc();
    
    // Lấy 2 bài viết có nhiều vote nhất
    @Query("SELECT a FROM Article a LEFT JOIN FETCH a.category ORDER BY a.voteCount DESC")
    List<Article> findTop2ByOrderByVoteCountDesc();
}

