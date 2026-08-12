package com.carbon.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "teams")
@Data
public class Team {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
    
    @Column(nullable = false) private String name;
    
    private String description;
    @Column(nullable = false) private boolean active = true;
}
