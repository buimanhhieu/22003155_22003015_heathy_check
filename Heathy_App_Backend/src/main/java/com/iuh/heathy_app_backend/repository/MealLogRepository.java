package com.iuh.heathy_app_backend.repository;

import com.iuh.heathy_app_backend.entity.MealLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealLogRepository extends JpaRepository<MealLog, Long> {
    
    // Lấy tổng calo trong ngày
    @Query("SELECT COALESCE(SUM(m.totalCalories), 0), MAX(m.loggedAt) FROM MealLog m WHERE m.user.id = :userId AND m.loggedAt >= :startOfDay AND m.loggedAt < :endOfDay")
    Object[] findDailyCaloriesAndLastUpdate(@Param("userId") Long userId, @Param("startOfDay") OffsetDateTime startOfDay, @Param("endOfDay") OffsetDateTime endOfDay);
    
    // Lấy tất cả meal logs trong ngày
    @Query("SELECT m FROM MealLog m WHERE m.user.id = :userId AND m.loggedAt >= :startOfDay AND m.loggedAt < :endOfDay ORDER BY m.loggedAt DESC")
    List<MealLog> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startOfDay") OffsetDateTime startOfDay, @Param("endOfDay") OffsetDateTime endOfDay);
}
