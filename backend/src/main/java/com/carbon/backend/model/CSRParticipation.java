package com.carbon.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "csr_participations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "project_id"})
})
@Data
public class CSRParticipation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable=false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="project_id", nullable=false)
    private CSRProject project;
    
    private Integer hoursLogged = 0;
    
    private LocalDateTime joinedDate;
    
    @PrePersist
    protected void onCreate() {
        this.joinedDate = LocalDateTime.now();
    }
}
