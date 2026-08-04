package com.carbon.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

public class SupportDTOs {

    @Data
    public static class SupportTicketRequest {
        private String category;
        private String priority;
        private String title;
        private String description;
        private String browser;
        private String device;
        private String os;
    }

    @Data
    public static class SupportReplyRequest {
        private String message;
        private Boolean isInternalNote = false;
    }

    @Data
    public static class SupportTicketResponse {
        private String ticketId;
        private String category;
        private String priority;
        private String title;
        private String description;
        private String status;
        private Long assignedAdminId;
        private String featureStatus;
        private Integer votes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class SupportReplyResponse {
        private String sender;
        private String message;
        private LocalDateTime createdAt;
    }
    
    @Data
    public static class SupportTicketDetailResponse {
        private String ticketId;
        private String category;
        private String priority;
        private String title;
        private String description;
        private String status;
        private String browser;
        private String device;
        private String os;
        private Long assignedAdminId;
        private String featureStatus;
        private Integer votes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private java.util.List<SupportReplyResponse> replies;
    }

    @Data
    public static class AdminSupportDashboardResponse {
        private long totalTickets;
        private long openTickets;
        private long inProgressTickets;
        private long resolvedTickets;
        private long closedTickets;
        private long criticalIssues;
        private long todaysTickets;
        private long thisWeekTickets;
        private String topCategory;
    }

    @Data
    public static class SupportRatingRequest {
        private Integer stars;
        private String comment;
    }

    @Data
    public static class SystemStatusResponse {
        private String backendServer = "Online";
        private String database = "Online";
        private String notificationService = "Online";
        private String analyticsEngine = "Online";
        private String leaderboardService = "Online";
        private String recommendationEngine = "Online";
    }
}
