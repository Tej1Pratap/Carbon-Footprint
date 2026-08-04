package com.carbon.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "support_replies")
@Data
public class SupportReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ticketId;

    @Column(nullable = false)
    private String sender; // USER or ADMIN

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    private String attachment;

    @Column(nullable = false)
    private Boolean isInternalNote = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
