package com.iuh.heathy_app_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "menstrual_cycles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MenstrualCycle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDate startDate;
    private LocalDate endDate;
}