package com.carbon.backend.controller;

import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.Badge;
import com.carbon.backend.model.Goal;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.repository.BadgeRepository;
import com.carbon.backend.repository.GoalRepository;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    @Autowired private ActivityLogRepository activityRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private GoalRepository goalRepo;
    @Autowired private BadgeRepository badgeRepo;

    @GetMapping("/overview")
    public ResponseEntity<?> getOverview(Authentication auth, @RequestParam(defaultValue = "weekly") String timeframe) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        Long userId = user.getId();
        
        List<ActivityLog> allLogs = activityRepo.findByUserId(userId);
        
        // 1. Summary Metrics
        double totalEmissions = allLogs.stream().mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
        
        LocalDate today = LocalDate.now();
        double todayEmissions = allLogs.stream()
            .filter(log -> log.getLogDate().toLocalDate().isEqual(today))
            .mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
            
        double monthlyEmissions = allLogs.stream()
            .filter(log -> log.getLogDate().toLocalDate().getMonth() == today.getMonth() && log.getLogDate().getYear() == today.getYear())
            .mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
            
        // Score Calculation (Baseline of 300kg/month. Score out of 100)
        int score = (int) Math.max(0, Math.min(100, 100 - (monthlyEmissions / 300.0) * 100 + 50));
        
        // 2. Trend Data
        List<Map<String, Object>> trendData = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        if (timeframe.equals("daily")) {
            java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("h a");
            Map<String, Double> trendMap = new LinkedHashMap<>();
            for (int i = 23; i >= 0; i--) trendMap.put(now.minusHours(i).format(fmt), 0.0);
            for (ActivityLog log : allLogs) {
                if (log.getLogDate() != null && log.getLogDate().isAfter(now.minusHours(24))) {
                    String key = log.getLogDate().format(fmt);
                    if (trendMap.containsKey(key)) trendMap.put(key, trendMap.get(key) + log.getEmissionsKgCo2());
                }
            }
            trendMap.forEach((k, v) -> trendData.add(Map.of("name", k, "emissions", v)));
        } else if (timeframe.equals("weekly")) {
            java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("MMM dd");
            Map<String, Double> trendMap = new LinkedHashMap<>();
            for (int i = 6; i >= 0; i--) trendMap.put(now.minusDays(i).format(fmt), 0.0);
            for (ActivityLog log : allLogs) {
                if (log.getLogDate() != null && log.getLogDate().isAfter(now.minusDays(7))) {
                    String key = log.getLogDate().format(fmt);
                    if (trendMap.containsKey(key)) trendMap.put(key, trendMap.get(key) + log.getEmissionsKgCo2());
                }
            }
            trendMap.forEach((k, v) -> trendData.add(Map.of("name", k, "emissions", v)));
        } else if (timeframe.equals("monthly")) {
            Map<String, Double> trendMap = new LinkedHashMap<>();
            for (int i = 4; i >= 1; i--) trendMap.put("Week " + (5 - i), 0.0);
            for (ActivityLog log : allLogs) {
                if (log.getLogDate() != null && log.getLogDate().isAfter(now.minusDays(28))) {
                    long daysAgo = java.time.Duration.between(log.getLogDate(), now).toDays();
                    int week = 4 - (int)(daysAgo / 7);
                    if (week >= 1 && week <= 4) {
                        String key = "Week " + week;
                        trendMap.put(key, trendMap.get(key) + log.getEmissionsKgCo2());
                    }
                }
            }
            trendMap.forEach((k, v) -> trendData.add(Map.of("name", k, "emissions", v)));
        } else if (timeframe.equals("yearly")) {
            java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("MMM yyyy");
            Map<String, Double> trendMap = new LinkedHashMap<>();
            for (int i = 11; i >= 0; i--) trendMap.put(now.minusMonths(i).format(fmt), 0.0);
            for (ActivityLog log : allLogs) {
                if (log.getLogDate() != null && log.getLogDate().isAfter(now.minusMonths(12))) {
                    String key = log.getLogDate().format(fmt);
                    if (trendMap.containsKey(key)) trendMap.put(key, trendMap.get(key) + log.getEmissionsKgCo2());
                }
            }
            trendMap.forEach((k, v) -> trendData.add(Map.of("name", k, "emissions", v)));
        }
        
        // 3. Category Breakdown (All Time & Today)
        Map<String, Double> categoryTotals = allLogs.stream()
            .collect(Collectors.groupingBy(ActivityLog::getCategory, Collectors.summingDouble(ActivityLog::getEmissionsKgCo2)));
        List<Map<String, Object>> categoryBreakdown = new ArrayList<>();
        categoryTotals.forEach((cat, val) -> categoryBreakdown.add(Map.of("name", cat, "value", val)));

        Map<String, Double> todayCategoryTotals = allLogs.stream()
            .filter(log -> log.getLogDate().toLocalDate().isEqual(today))
            .collect(Collectors.groupingBy(ActivityLog::getCategory, Collectors.summingDouble(ActivityLog::getEmissionsKgCo2)));
        List<Map<String, Object>> todayCategoryBreakdown = new ArrayList<>();
        todayCategoryTotals.forEach((cat, val) -> todayCategoryBreakdown.add(Map.of("name", cat, "value", val)));
        
        // 4. Recent Activity (Top 5)
        List<ActivityLog> recentActivity = allLogs.stream()
            .sorted(Comparator.comparing(ActivityLog::getLogDate).reversed())
            .limit(5)
            .collect(Collectors.toList());
            
        // 5. Active Goal
        List<Goal> goals = goalRepo.findByUserId(userId);
        Goal activeGoal = goals.isEmpty() ? null : goals.get(goals.size() - 1);
        
        // 6. Latest Badge
        List<Badge> badges = badgeRepo.findByUserId(userId);
        Badge latestBadge = badges.isEmpty() ? null : badges.get(badges.size() - 1);
        
        // 7. Leaderboard Preview (Top 3)
        List<Object[]> topUsers = userRepo.getLeaderboardPreview(org.springframework.data.domain.PageRequest.of(0, 3));
        List<Map<String, Object>> leaderboard = topUsers.stream().map(row -> {
            Map<String, Object> map = new HashMap<>();
            map.put("username", row[0]);
            map.put("totalEmissions", row[2]);
            map.put("isCurrentUser", userId.equals(row[1]));
            return map;
        }).collect(Collectors.toList());

        // Recommendation
        String recommendation = categoryBreakdown.isEmpty() ? "Start logging activities to get recommendations!" : 
            "Try using public transport this week to lower your Transport emissions.";

        Map<String, Object> response = new HashMap<>();
        response.put("user", user);
        response.put("totalEmissions", totalEmissions);
        response.put("todayEmissions", todayEmissions);
        response.put("monthlyEmissions", monthlyEmissions);
        response.put("carbonScore", score);
        response.put("trendData", trendData);
        response.put("categoryBreakdown", categoryBreakdown);
        response.put("todayCategoryBreakdown", todayCategoryBreakdown);
        response.put("recentActivity", recentActivity);
        response.put("activeGoal", activeGoal);
        response.put("latestBadge", latestBadge);
        response.put("leaderboard", leaderboard);
        response.put("recommendation", recommendation);

        return ResponseEntity.ok(response);
    }
}
