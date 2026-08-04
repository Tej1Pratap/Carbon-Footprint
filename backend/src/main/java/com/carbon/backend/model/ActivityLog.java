package com.carbon.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Data
public class ActivityLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name="user_id", nullable=false) private User user;
    @Column(nullable = false) private String category;
    @Column(nullable = false) private String activityType;
    @Column(nullable = false) private Double quantity;
    @Column(nullable = false) private String unit;
    @Column(nullable = false) private LocalDateTime logDate;
    @Column(nullable = false) private Double emissionsKgCo2;
}
