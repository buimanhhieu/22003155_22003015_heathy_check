package com.iuh.heathy_app_backend.repository;

import com.iuh.heathy_app_backend.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByUserId(Long userId);

    @Query("select u.weightKg /  ((u.heightCm/100)*(u.heightCm/100))  as bmi from UserProfile u where u.userId = :id")
    double getBMI(Long id);
}
