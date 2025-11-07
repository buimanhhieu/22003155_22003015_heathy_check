package com.iuh.heathy_app_backend.repository;

import com.iuh.heathy_app_backend.entity.ArticleVote;
import com.iuh.heathy_app_backend.entity.ArticleVoteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArticleVoteRepository extends JpaRepository<ArticleVote, ArticleVoteId> {
    @Query("SELECT av FROM ArticleVote av WHERE av.user.id = :userId AND av.article.id = :articleId")
    Optional<ArticleVote> findByUserIdAndArticleId(@Param("userId") Long userId, @Param("articleId") Long articleId);
    
    @Query("SELECT COUNT(av) > 0 FROM ArticleVote av WHERE av.user.id = :userId AND av.article.id = :articleId")
    boolean existsByUserIdAndArticleId(@Param("userId") Long userId, @Param("articleId") Long articleId);
}

