package com.carbon.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "badges")
@Data
public class Badge {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name="user_id", nullable=false) private User user;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String icon;
    @Column(nullable = false) private LocalDate earnedDate;
}
