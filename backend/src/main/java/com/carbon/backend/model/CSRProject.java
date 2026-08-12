package com.carbon.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "csr_projects")
@Data
public class CSRProject {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="organization_id", nullable=false)
    private Organization organization;
    
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String category; // e.g. Tree Planting, Beach Cleanup
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private LocalDate projectDate;
    private Double budget;
    private Integer beneficiariesCount;
    
    // UPCOMING, IN_PROGRESS, COMPLETED, CANCELLED
    @Column(nullable = false) private String status = "UPCOMING";
    
    private LocalDateTime createdDate;
    
    @PrePersist
    protected void onCreate() {
        this.createdDate = LocalDateTime.now();
    }
}
