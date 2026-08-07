package com.carbon.backend.controller;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.model.ActivityLog;

import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired private UserRepository userRepo;
    @Autowired private ActivityLogRepository activityRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, Object> settings, Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        
        if (settings.containsKey("sustainabilityPreference") && settings.get("sustainabilityPreference") != null) {
            user.setSustainabilityPreference(settings.get("sustainabilityPreference").toString());
        }
        
        if (settings.containsKey("username") && settings.get("username") != null) {
            user.setUsername(settings.get("username").toString());
        }
        
        if (settings.containsKey("password") && settings.get("password") != null) {
            user.setPassword(passwordEncoder.encode(settings.get("password").toString()));
        }
        
        if (settings.containsKey("profilePicture") && settings.get("profilePicture") != null) {
            user.setProfilePicture(settings.get("profilePicture").toString());
        }

        // New Boolean and String preferences
        if (settings.containsKey("emailAlerts") && settings.get("emailAlerts") != null) {
            user.setEmailAlerts(Boolean.parseBoolean(settings.get("emailAlerts").toString()));
        }
        if (settings.containsKey("goalAlerts") && settings.get("goalAlerts") != null) {
            user.setGoalAlerts(Boolean.parseBoolean(settings.get("goalAlerts").toString()));
        }
        if (settings.containsKey("leaderboardAlerts") && settings.get("leaderboardAlerts") != null) {
            user.setLeaderboardAlerts(Boolean.parseBoolean(settings.get("leaderboardAlerts").toString()));
        }
        if (settings.containsKey("publicProfile") && settings.get("publicProfile") != null) {
            user.setPublicProfile(Boolean.parseBoolean(settings.get("publicProfile").toString()));
        }
        if (settings.containsKey("metric") && settings.get("metric") != null) {
            user.setMetric(settings.get("metric").toString());
        }
        
        return ResponseEntity.ok(userRepo.save(user));
    }
    
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteAccount(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        // Clean up activities to avoid foreign key constraints
        activityRepo.deleteByUserId(user.getId());
        // Delete user
        userRepo.delete(user);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
    
    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard() {
        List<User> users = userRepo.findAll().stream().filter(u -> !"ADMIN".equalsIgnoreCase(u.getRole())).collect(Collectors.toList());
        List<Map<String, Object>> leaderboard = users.stream().map(u -> {
            List<ActivityLog> logs = activityRepo.findByUserId(u.getId());
            double total = logs.stream().mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
            
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("username", u.getUsername());
            map.put("totalEmissions", total);
            map.put("logsCount", logs.size());
            return map;
        })
        .sorted((a, b) -> Double.compare((Double)a.get("totalEmissions"), (Double)b.get("totalEmissions")))
        .limit(10)
        .collect(Collectors.toList());
        return ResponseEntity.ok(leaderboard);
    }
}
