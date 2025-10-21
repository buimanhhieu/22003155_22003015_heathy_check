package com.iuh.heathy_app_backend.repository;

import com.iuh.heathy_app_backend.entity.HealthDataEntry;
import com.iuh.heathy_app_backend.entity.HealthMetricType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HealthDataEntryRepository extends JpaRepository<HealthDataEntry, Long> {
    
    // Lấy dữ liệu mới nhất của một metric trong ngày
    @Query("SELECT h FROM HealthDataEntry h WHERE h.user.id = :userId AND h.metricType = :metricType AND h.recordedAt >= :startOfDay AND h.recordedAt < :endOfDay ORDER BY h.recordedAt DESC LIMIT 1")
    Optional<HealthDataEntry> findLatestTodayByUserAndMetric(@Param("userId") Long userId, @Param("metricType") HealthMetricType metricType, @Param("startOfDay") OffsetDateTime startOfDay, @Param("endOfDay") OffsetDateTime endOfDay);
    
    // Lấy dữ liệu mới nhất trong khoảng thời gian
    @Query("SELECT h FROM HealthDataEntry h WHERE h.user.id = :userId AND h.metricType = :metricType AND h.recordedAt >= :startTime ORDER BY h.recordedAt DESC LIMIT 1")
    Optional<HealthDataEntry> findLatestByUserAndMetricAndTimeRange(@Param("userId") Long userId, @Param("metricType") HealthMetricType metricType, @Param("startTime") OffsetDateTime startTime);
    
    // Lấy tổng dữ liệu trong tuần
    @Query("SELECT h.metricType, SUM(h.value) FROM HealthDataEntry h WHERE h.user.id = :userId AND h.recordedAt >= :weekStart AND h.metricType IN :metricTypes GROUP BY h.metricType")
    List<Object[]> findWeeklyTotalsByUserAndMetrics(@Param("userId") Long userId, @Param("weekStart") OffsetDateTime weekStart, @Param("metricTypes") List<HealthMetricType> metricTypes);
    
    // Lấy dữ liệu gần đây cho health score
    @Query("SELECT h FROM HealthDataEntry h WHERE h.user.id = :userId AND h.metricType IN :metricTypes AND h.recordedAt >= :startTime ORDER BY h.recordedAt DESC")
    List<HealthDataEntry> findRecentDataForHealthScore(@Param("userId") Long userId, @Param("metricTypes") List<HealthMetricType> metricTypes, @Param("startTime") OffsetDateTime startTime);
}
