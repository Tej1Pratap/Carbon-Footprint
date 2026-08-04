package com.carbon.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "support_faqs")
@Data
public class SupportFAQ {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String question;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String answer;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Integer displayOrder;

    @Column(nullable = false)
    private Boolean isPinned = false;

    @Column(nullable = false)
    private String status = "PUBLISHED";
}
