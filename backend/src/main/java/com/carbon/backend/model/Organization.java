package com.carbon.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "organizations")
@Data
public class Organization {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    
    @Column(nullable = false, unique = true) private String name;
    
    private String industry;
    private String companySize;
    private String country;
    private String stateRegion;
    private String website;
    private String contactEmail;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String sustainabilityTarget;
    private Double csrBudget;
    
    @Column(columnDefinition = "LONGTEXT")
    private String logo;
    
    @Column(nullable = false) private String status = "ACTIVE"; // ACTIVE, PENDING, SUSPENDED, ARCHIVED
    
    private LocalDateTime createdDate;
    
    @PrePersist
    protected void onCreate() {
        this.createdDate = LocalDateTime.now();
    }
}
