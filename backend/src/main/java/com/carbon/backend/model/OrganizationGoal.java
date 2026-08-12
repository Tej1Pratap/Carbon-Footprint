package com.carbon.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "organization_goals")
@Data
public class OrganizationGoal {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="organization_id", nullable=false)
    private Organization organization;
    
    @Column(nullable = false) private String description;
    @Column(nullable = false) private Double targetReductionPercentage;
    @Column(nullable = false) private Double baselineEmissions;
    @Column(nullable = false) private LocalDate deadline;
    
    // ON_TRACK, AT_RISK, ACHIEVED, EXPIRED
    @Column(nullable = false) private String status = "ON_TRACK";
}
