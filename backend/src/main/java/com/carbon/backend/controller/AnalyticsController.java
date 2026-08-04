package com.carbon.backend.controller;
import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    @Autowired private ActivityLogRepository activityRepo;
    @Autowired private UserRepository userRepo;

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(Authentication auth, @RequestParam(defaultValue = "weekly") String timeframe) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        List<ActivityLog> logs = activityRepo.findByUserId(user.getId());
        
        Map<String, Double> categoryTotals = logs.stream()
            .collect(Collectors.groupingBy(ActivityLog::getCategory, Collectors.summingDouble(ActivityLog::getEmissionsKgCo2)));
            
        double totalEmissions = logs.stream().mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
        
        List<Map<String, Object>> chartData = new ArrayList<>();
        categoryTotals.forEach((cat, val) -> {
            chartData.add(Map.of("name", cat, "value", val));
        });

        // Generate trendData based on timeframe
        List<Map<String, Object>> trendData = new ArrayList<>();
        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        if (timeframe.equals("daily")) {
            java.time.format.DateTimeFormatter fmt = java.time.format.DateTimeFormatter.ofPattern("h a");
            Map<String, Double> trendMap = new LinkedHashMap<>();
            for (int i = 23; i >= 0; i--) trendMap.put(now.minusHours(i).format(fmt), 0.0);
            for (ActivityLog log : logs) {
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
            for (ActivityLog log : logs) {
                if (log.getLogDate() != null && log.getLogDate().isAfter(now.minusDays(7))) {
                    String key = log.getLogDate().format(fmt);
                    if (trendMap.containsKey(key)) trendMap.put(key, trendMap.get(key) + log.getEmissionsKgCo2());
                }
            }
            trendMap.forEach((k, v) -> trendData.add(Map.of("name", k, "emissions", v)));
        } else if (timeframe.equals("monthly")) {
            Map<String, Double> trendMap = new LinkedHashMap<>();
            for (int i = 4; i >= 1; i--) trendMap.put("Week " + (5 - i), 0.0);
            for (ActivityLog log : logs) {
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
            for (ActivityLog log : logs) {
                if (log.getLogDate() != null && log.getLogDate().isAfter(now.minusMonths(12))) {
                    String key = log.getLogDate().format(fmt);
                    if (trendMap.containsKey(key)) trendMap.put(key, trendMap.get(key) + log.getEmissionsKgCo2());
                }
            }
            trendMap.forEach((k, v) -> trendData.add(Map.of("name", k, "emissions", v)));
        }

        return ResponseEntity.ok(Map.of(
            "totalEmissions", totalEmissions,
            "chartData", chartData,
            "trendData", trendData,
            "recentActivityCount", logs.size()
        ));
    }

    @GetMapping("/benchmark")
    public ResponseEntity<?> getPeerBenchmark(Authentication auth) {
        User currentUser = userRepo.findByEmail(auth.getName()).orElseThrow();
        List<ActivityLog> allPlatformLogs = activityRepo.findAll();
        
        // Calculate current user totals per category
        Map<String, Double> currentUserTotals = allPlatformLogs.stream()
                .filter(log -> log.getUser().getId().equals(currentUser.getId()))
                .collect(Collectors.groupingBy(ActivityLog::getCategory, Collectors.summingDouble(ActivityLog::getEmissionsKgCo2)));
                
        // Calculate average totals per user per category
        Map<Long, Map<String, Double>> userCategoryTotals = allPlatformLogs.stream()
                .collect(Collectors.groupingBy(
                        log -> log.getUser().getId(),
                        Collectors.groupingBy(ActivityLog::getCategory, Collectors.summingDouble(ActivityLog::getEmissionsKgCo2))
                ));
                
        int totalUsers = userRepo.findAll().size();
        if (totalUsers == 0) totalUsers = 1; // Prevent div by zero
        
        Map<String, Double> platformAverages = new HashMap<>();
        for (Map<String, Double> catTotals : userCategoryTotals.values()) {
            catTotals.forEach((category, total) -> {
                platformAverages.put(category, platformAverages.getOrDefault(category, 0.0) + total);
            });
        }
        
        // Finalize averages
        final int userCount = totalUsers;
        platformAverages.replaceAll((cat, sum) -> sum / userCount);
        
        List<Map<String, Object>> benchmarkResults = new ArrayList<>();
        Set<String> allCategories = new HashSet<>();
        allCategories.addAll(currentUserTotals.keySet());
        allCategories.addAll(platformAverages.keySet());
        
        for (String category : allCategories) {
            double myTotal = currentUserTotals.getOrDefault(category, 0.0);
            double avgTotal = platformAverages.getOrDefault(category, 0.0);
            
            // Calculate rank to find Top %
            long usersBetterThanMe = userCategoryTotals.values().stream()
                    .mapToDouble(totals -> totals.getOrDefault(category, 0.0))
                    .filter(val -> val < myTotal)
                    .count();
                    
            double topPercentile = ((double) (usersBetterThanMe + 1) / totalUsers) * 100;
            if (topPercentile < 1.0 && totalUsers > 1) topPercentile = 1.0;
            
            benchmarkResults.add(Map.of(
                "category", category,
                "myEmissions", myTotal,
                "averageEmissions", avgTotal,
                "percentileBetterThan", topPercentile,
                "isBetter", myTotal <= avgTotal
            ));
        }
        
        return ResponseEntity.ok(benchmarkResults);
    }
}
