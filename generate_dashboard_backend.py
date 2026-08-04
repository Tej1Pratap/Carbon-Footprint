import os

# Backend Directory
backend_dir = r"c:\Users\Admin\OneDrive\Desktop\Carbon Footprint\backend\src\main\java\com\carbon\backend"
controllers_dir = os.path.join(backend_dir, "controller")

files = {}

# Unified Dashboard Controller
files['controller/DashboardController.java'] = """package com.carbon.backend.controller;

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
    public ResponseEntity<?> getOverview(Authentication auth) {
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
        
        // 2. Weekly Trend (Last 7 Days including today)
        List<Map<String, Object>> weeklyTrend = new ArrayList<>();
        String[] days = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            double dailySum = allLogs.stream()
                .filter(log -> log.getLogDate().toLocalDate().isEqual(d))
                .mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
            weeklyTrend.add(Map.of("name", days[d.getDayOfWeek().getValue() % 7], "emissions", dailySum));
        }
        
        // 3. Category Breakdown
        Map<String, Double> categoryTotals = allLogs.stream()
            .collect(Collectors.groupingBy(ActivityLog::getCategory, Collectors.summingDouble(ActivityLog::getEmissionsKgCo2)));
        List<Map<String, Object>> categoryBreakdown = new ArrayList<>();
        categoryTotals.forEach((cat, val) -> categoryBreakdown.add(Map.of("name", cat, "value", val)));
        
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
        List<User> users = userRepo.findAll();
        List<Map<String, Object>> leaderboard = users.stream().map(u -> {
            List<ActivityLog> logs = activityRepo.findByUserId(u.getId());
            double total = logs.stream().mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
            Map<String, Object> map = new HashMap<>();
            map.put("username", u.getUsername());
            map.put("totalEmissions", total);
            map.put("isCurrentUser", u.getId().equals(userId));
            return map;
        })
        .sorted((a, b) -> Double.compare((Double)a.get("totalEmissions"), (Double)b.get("totalEmissions")))
        .limit(3)
        .collect(Collectors.toList());

        // Recommendation
        String recommendation = categoryBreakdown.isEmpty() ? "Start logging activities to get recommendations!" : 
            "Try using public transport this week to lower your Transport emissions.";

        Map<String, Object> response = new HashMap<>();
        response.put("user", user);
        response.put("totalEmissions", totalEmissions);
        response.put("todayEmissions", todayEmissions);
        response.put("monthlyEmissions", monthlyEmissions);
        response.put("carbonScore", score);
        response.put("weeklyTrend", weeklyTrend);
        response.put("categoryBreakdown", categoryBreakdown);
        response.put("recentActivity", recentActivity);
        response.put("activeGoal", activeGoal);
        response.put("latestBadge", latestBadge);
        response.put("leaderboard", leaderboard);
        response.put("recommendation", recommendation);

        return ResponseEntity.ok(response);
    }
}
"""

for rel_path, content in files.items():
    with open(os.path.join(backend_dir, rel_path), "w") as f:
        f.write(content)
print("Generated Dashboard Backend Controller")
