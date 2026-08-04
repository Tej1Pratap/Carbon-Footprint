package com.carbon.backend.dto;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

public class LeaderboardDTOs {
    
    @Data
    public static class LeaderboardEntry {
        private Long userId;
        private String username;
        private String profilePicture;
        private String country;
        private Double carbonEmission;
        private Long ecoPoints;
        private Integer activitiesLogged;
        private Integer treesSaved;
        private List<String> badges;
        private Integer currentStreak;
        private Integer longestStreak;
        private Integer level;
        private String rankChange;
        private Integer rankChangeValue;
        private LocalDateTime joinedDate;
        private LocalDateTime earliestAchievement;
        private String role;
        private Integer rank;
        private Boolean publicProfile;
    }

    @Data
    public static class CommunityStats {
        private Integer totalMembers;
        private Double totalCarbonSaved;
        private Double averageEmission;
        private Integer todayActivities;
        private Integer communityGoal;
        private Double weeklyChallengeProgress;
    }

    @Data
    public static class RankCard {
        private Integer currentRank;
        private Long ecoPoints;
        private Integer currentStreak;
        private Double carbonEmission;
        private Integer nextRank;
        private Long pointsRequired;
        private String motivationalMessage;
    }
}
