package com.carbon.backend.controller;

import com.carbon.backend.repository.UserRepository;
import com.carbon.backend.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.count(); // Could be filtered by status or lastLogin
        long totalActivities = activityLogRepository.count();
        
        java.util.List<com.carbon.backend.model.ActivityLog> allLogs = activityLogRepository.findAll();
        Double totalEmissions = allLogs.stream().mapToDouble(com.carbon.backend.model.ActivityLog::getEmissionsKgCo2).sum();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsersToday", activeUsers);
        stats.put("totalActivities", totalActivities);
        stats.put("totalEmissions", totalEmissions);
        stats.put("averageEmissionPerUser", totalUsers > 0 ? (totalEmissions / totalUsers) : 0);
        stats.put("goalsAchieved", 0);
        stats.put("badgesAwarded", 0);
        stats.put("newUsersThisMonth", totalUsers);
        
        return ResponseEntity.ok(stats);
    }
}
