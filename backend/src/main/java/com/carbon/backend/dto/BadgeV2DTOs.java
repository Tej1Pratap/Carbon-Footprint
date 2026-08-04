package com.carbon.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

public class BadgeV2DTOs {

    @Data
    public static class DynamicBadgeStatus {
        private String id;
        private String name;
        private int earnedCount;
        private String currentStatus; // "ACTIVE", "WARNING", "LOCKED"
        private double currentProgress;
        private double currentTarget;
        private LocalDateTime lastEarnedDate;
    }
}
