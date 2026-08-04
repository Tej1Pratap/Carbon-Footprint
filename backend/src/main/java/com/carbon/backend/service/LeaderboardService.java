package com.carbon.backend.service;

import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.User;
import com.carbon.backend.model.Badge;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.repository.BadgeRepository;
import com.carbon.backend.repository.UserRepository;
import com.carbon.backend.dto.LeaderboardDTOs.LeaderboardEntry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeaderboardService {

    @Autowired private UserRepository userRepository;
    @Autowired private ActivityLogRepository activityLogRepository;
    @Autowired private BadgeRepository badgeRepository;

    public List<LeaderboardEntry> getFullLeaderboard() {
        List<User> users = userRepository.findAll();
        List<LeaderboardEntry> entries = new ArrayList<>();

        for (User u : users) {
            List<ActivityLog> logs = activityLogRepository.findByUserId(u.getId());
            List<Badge> userBadges = badgeRepository.findByUserId(u.getId());
            
            entries.add(calculateEntryForUser(u, logs, userBadges));
        }

        // Sorting Logic (Strict 8-step Tie-Breaker)
        // 1. Lowest Carbon Emission
        // 2. Highest Eco Points
        // 3. Highest Activities Logged
        // 4. Longest Green Streak
        // 5. Highest Trees Saved
        // 6. Earliest Achievement Timestamp
        // 7. Oldest Account
        // 8. Username
        entries.sort((a, b) -> {
            // Push users with 0 activities to the bottom of the leaderboard
            if (a.getActivitiesLogged() == 0 && b.getActivitiesLogged() > 0) return 1;
            if (b.getActivitiesLogged() == 0 && a.getActivitiesLogged() > 0) return -1;

            int c = Double.compare(a.getCarbonEmission(), b.getCarbonEmission());
            if (c != 0) return c;
            c = Long.compare(b.getEcoPoints(), a.getEcoPoints());
            if (c != 0) return c;
            c = Integer.compare(b.getActivitiesLogged(), a.getActivitiesLogged());
            if (c != 0) return c;
            c = Integer.compare(b.getLongestStreak(), a.getLongestStreak());
            if (c != 0) return c;
            c = Integer.compare(b.getTreesSaved(), a.getTreesSaved());
            if (c != 0) return c;
            if (a.getEarliestAchievement() != null && b.getEarliestAchievement() != null) {
                c = a.getEarliestAchievement().compareTo(b.getEarliestAchievement());
                if (c != 0) return c;
            } else if (a.getEarliestAchievement() != null) {
                return -1;
            } else if (b.getEarliestAchievement() != null) {
                return 1;
            }
            if (a.getJoinedDate() != null && b.getJoinedDate() != null) {
                c = a.getJoinedDate().compareTo(b.getJoinedDate());
                if (c != 0) return c;
            } else if (a.getJoinedDate() != null) {
                return -1;
            } else if (b.getJoinedDate() != null) {
                return 1;
            }
            if (a.getUsername() != null && b.getUsername() != null) {
                return a.getUsername().compareToIgnoreCase(b.getUsername());
            }
            return 0;
        });

        // Assign ranks and calculate mock rank changes
        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
            // Mocking rank change for visual effect
            entries.get(i).setRankChange(i % 3 == 0 ? "UP" : i % 2 == 0 ? "DOWN" : "SAME");
            entries.get(i).setRankChangeValue(i % 3 == 0 ? 2 : i % 2 == 0 ? 1 : 0);
        }

        return entries;
    }

    private LeaderboardEntry calculateEntryForUser(User u, List<ActivityLog> logs, List<Badge> badges) {
        LeaderboardEntry entry = new LeaderboardEntry();
        entry.setUserId(u.getId());
        entry.setUsername(u.getUsername());
        entry.setProfilePicture(u.getProfilePicture());
        entry.setRole(u.getRole());
        entry.setJoinedDate(u.getRegistrationDate() != null ? u.getRegistrationDate() : LocalDateTime.now().minusDays(new Random().nextInt(100)));
        entry.setPublicProfile(u.getPublicProfile() == null ? true : u.getPublicProfile());
        // Mock country if not in User entity
        entry.setCountry("Global");

        double totalEmissions = 0;
        long ecoPoints = 0;
        LocalDateTime earliestAchievement = null;
        
        Set<LocalDate> activityDates = new TreeSet<>();

        for (ActivityLog log : logs) {
            totalEmissions += log.getEmissionsKgCo2();
            ecoPoints += calculatePointsForActivity(log);
            activityDates.add(log.getLogDate().toLocalDate());
            
            if (earliestAchievement == null || log.getLogDate().isBefore(earliestAchievement)) {
                earliestAchievement = log.getLogDate();
            }
        }
        
        for (Badge badge : badges) {
            if (badge.getEarnedDate() != null) {
                // If badge.getEarnedDate() is LocalDate, we convert to LocalDateTime
                LocalDateTime badgeTime = badge.getEarnedDate().atStartOfDay();
                if (earliestAchievement == null || badgeTime.isBefore(earliestAchievement)) {
                    earliestAchievement = badgeTime;
                }
            }
        }
        
        entry.setEarliestAchievement(earliestAchievement);

        entry.setCarbonEmission(totalEmissions);
        entry.setEcoPoints(ecoPoints);
        entry.setActivitiesLogged(logs.size());
        
        // 1 tree saved per 50 Eco Points (mock metric)
        entry.setTreesSaved((int)(ecoPoints / 50));

        // Streaks
        List<LocalDate> datesList = new ArrayList<>(activityDates);
        int currentStreak = 0;
        int longestStreak = 0;
        int tempStreak = 0;
        LocalDate prevDate = null;
        
        for (LocalDate date : datesList) {
            if (prevDate == null || prevDate.plusDays(1).equals(date)) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
            if (tempStreak > longestStreak) longestStreak = tempStreak;
            prevDate = date;
        }
        
        // current streak logic
        if (!datesList.isEmpty()) {
            LocalDate lastDate = datesList.get(datesList.size() - 1);
            if (lastDate.equals(LocalDate.now()) || lastDate.equals(LocalDate.now().minusDays(1))) {
                currentStreak = tempStreak;
            }
        }
        
        entry.setCurrentStreak(currentStreak);
        entry.setLongestStreak(longestStreak);
        
        // Level: 1 Level per 1000 Eco Points, base level 1
        entry.setLevel(1 + (int)(ecoPoints / 1000));
        
        entry.setBadges(badges.stream().map(Badge::getName).collect(Collectors.toList()));

        return entry;
    }

    private long calculatePointsForActivity(ActivityLog log) {
        if (log.getActivityType() == null) return 10;
        String type = log.getActivityType().toLowerCase();
        if (type.contains("walk")) return 20;
        if (type.contains("cycle") || type.contains("bike")) return 25;
        if (type.contains("bus")) return 15;
        if (type.contains("metro") || type.contains("subway")) return 15;
        if (type.contains("train")) return 20;
        if (type.contains("tree") || type.contains("plant")) return 100;
        if (type.contains("solar")) return 60;
        if (type.contains("recycle")) return 40;
        if (type.contains("rain") || type.contains("water")) return 80;
        if (type.contains("energy") || type.contains("power")) return 30;
        return 10;
    }
}
