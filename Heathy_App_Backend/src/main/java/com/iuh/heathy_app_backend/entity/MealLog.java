package com.iuh.heathy_app_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.iuh.heathy_app_backend.entity.MealType;
import java.time.OffsetDateTime;

@Entity
@Table(name = "meal_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MealLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private String mealName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type")
    private MealType mealType;
    
    private Double totalCalories;
    private Double fatGrams;
    private Double proteinGrams;
    private Double carbsGrams;

    @Column(name = "logged_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime loggedAt = OffsetDateTime.now();
}