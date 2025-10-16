package com.iuh.heathy_app_backend.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "health_data_entries", indexes = {
        @Index(name = "idx_health_data_user_time", columnList = "user_id, recorded_at DESC")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class HealthDataEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type", nullable = false)
    private HealthMetricType metricType;

    private Double value;
    private String unit;

    @Column(name = "recorded_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime recordedAt = OffsetDateTime.now();
}