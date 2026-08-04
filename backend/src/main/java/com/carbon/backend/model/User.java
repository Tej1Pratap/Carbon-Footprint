package com.carbon.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, unique = true) private String username;
    @Column(nullable = false, unique = true) private String email;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false) private String password;
    @Column(nullable = false) private String role = "USER";
    private String sustainabilityPreference;

    @Column(columnDefinition = "LONGTEXT")
    private String profilePicture;
    private String phone;
    @Column(nullable = false) private String status = "ACTIVE"; // ACTIVE, INACTIVE, SUSPENDED
    
    @Column(nullable = false) private boolean enabled = false;
    @Column(nullable = false) private boolean emailVerified = false;
    
    private java.time.LocalDateTime registrationDate;
    private java.time.LocalDateTime lastLogin;

    @PrePersist
    protected void onCreate() {
        this.registrationDate = java.time.LocalDateTime.now();
    }
    
    // Field for event-driven badge tracking
    private Double totalKgSaved = 0.0;
    
    // Preferences & Settings
    @Column(nullable = false) private Boolean emailAlerts = true;
    @Column(nullable = false) private Boolean goalAlerts = true;
    @Column(nullable = false) private Boolean leaderboardAlerts = false;
    @Column(nullable = false) private Boolean publicProfile = true;
    @Column(nullable = false) private String metric = "kg";
}
