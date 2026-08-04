package com.carbon.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "goals")
@Data
public class Goal {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name="user_id", nullable=false) private User user;
    @Column(nullable = false) private String description;
    @Column(nullable = false) private Double targetKgCo2;
    @Column(nullable = false) private LocalDate deadline;
    @Column(nullable = false) private String status = "IN_PROGRESS";
    
    // New fields for advanced tracking
    private LocalDate startDate;
    private Integer periodDays;
    private Double baselineEmissions;
    private Double targetReductionPercentage;
    
    // Tracks the last status we notified the user about (e.g. ON_TRACK, AT_RISK)
    private String lastNotifiedStatus;
}
