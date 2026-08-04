package com.carbon.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "system_settings")
@Data
public class SystemSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String settingKey;
    
    @Column(nullable = false)
    private String settingValue;
    
    private String description;
}
