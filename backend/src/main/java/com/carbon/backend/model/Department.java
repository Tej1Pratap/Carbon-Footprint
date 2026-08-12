package com.carbon.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "departments")
@Data
public class Department {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;
    
    @Column(nullable = false) private String name;
    
    private String description;
    @Column(nullable = false) private boolean active = true;
}
