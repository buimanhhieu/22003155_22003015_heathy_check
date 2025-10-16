package com.iuh.heathy_app_backend.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "daily_symptoms",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "symptom_name", "log_date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DailySymptom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "symptom_name", nullable = false)
    private String symptomName;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;
}