package com.iuh.heathy_app_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalTime;

@Entity
@Table(name = "user_goals")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserGoal {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private Integer dailyStepsGoal = 10000;
    private Integer dailyCaloriesGoal = 2000;
    private LocalTime scheduledBedtime;
    private LocalTime scheduledWakeup;
}
