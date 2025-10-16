package com.iuh.heathy_app_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "data_sharing_permissions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DataSharingPermission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "sharer_user_id", nullable = false)
    private User sharer;

    private String recipientEmail;
    private String permissionLevel;

    @Enumerated(EnumType.STRING)
    private SharingStatus status = SharingStatus.PENDING;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}