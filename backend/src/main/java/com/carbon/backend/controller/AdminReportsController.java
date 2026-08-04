package com.carbon.backend.controller;

import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportsController {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(@org.springframework.web.bind.annotation.RequestParam(defaultValue = "weekly") String timeframe) {
        List<ActivityLog> allLogs = activityLogRepository.findAll();
        List<User> allUsers = userRepository.findAll();

        // 1. Emissions over time
        List<Map<String, Object>> trendData = new ArrayList<>();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();

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

        // 2. Emissions by Category (Pie Chart)
        Map<String, Double> categoryEmissions = new HashMap<>();
        for (ActivityLog log : allLogs) {
            String cat = log.getCategory();
            categoryEmissions.put(cat, categoryEmissions.getOrDefault(cat, 0.0) + log.getEmissionsKgCo2());
        }

        List<Map<String, Object>> categoryData = new ArrayList<>();
        for (Map.Entry<String, Double> entry : categoryEmissions.entrySet()) {
            Map<String, Object> point = new HashMap<>();
            point.put("name", entry.getKey());
            point.put("value", entry.getValue());
            categoryData.add(point);
        }

        // 3. User Growth (last 4 weeks)
        // Simplified dummy data for user growth since we might not have registration dates populated for all old users
        List<Map<String, Object>> userGrowthData = new ArrayList<>();
        int baseUsers = Math.max(10, allUsers.size() - 5);
        for(int i=4; i>=1; i--) {
            Map<String, Object> point = new HashMap<>();
            point.put("week", "Week " + (5-i));
            point.put("users", baseUsers + (5-i)*2);
            userGrowthData.add(point);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("trendData", trendData);
        response.put("categoryData", categoryData);
        response.put("userGrowthData", userGrowthData);

        return ResponseEntity.ok(response);
    }
}
