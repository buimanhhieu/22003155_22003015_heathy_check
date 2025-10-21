package com.iuh.heathy_app_backend.repository;

import com.iuh.heathy_app_backend.entity.MenstrualCycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MenstrualCycleRepository extends JpaRepository<MenstrualCycle, Long> {
    
    // Lấy chu kỳ gần nhất
    @Query("SELECT m FROM MenstrualCycle m WHERE m.user.id = :userId ORDER BY m.startDate DESC")
    Optional<MenstrualCycle> findLatestByUser(@Param("userId") Long userId);
}

