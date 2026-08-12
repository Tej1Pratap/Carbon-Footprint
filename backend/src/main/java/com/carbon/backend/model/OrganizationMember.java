package com.carbon.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "organization_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "organization_id"})
})
@Data
public class OrganizationMember {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;
    
    @Column(nullable = false)
    private String role = "EMPLOYEE"; // ORG_ADMIN, CSR_MANAGER, HR_MANAGER, DEPARTMENT_MANAGER, EMPLOYEE
    
    @Column(nullable = false)
    private boolean active = true;
    
    private LocalDateTime joinedDate;
    
    @PrePersist
    protected void onCreate() {
        this.joinedDate = LocalDateTime.now();
    }
}
