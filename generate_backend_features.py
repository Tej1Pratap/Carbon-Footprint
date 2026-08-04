import os

base_dir = r"c:\Users\Admin\OneDrive\Desktop\Carbon Footprint\backend\src\main\java\com\carbon\backend"
files = {}

# Entities
files['model/Goal.java'] = """package com.carbon.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "goals")
@Data
public class Goal {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name="user_id", nullable=false) private User user;
    @Column(nullable = false) private String description;
    @Column(nullable = false) private Double targetKgCo2;
    @Column(nullable = false) private LocalDate deadline;
    @Column(nullable = false) private String status = "IN_PROGRESS";
}
"""

files['model/Badge.java'] = """package com.carbon.backend.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "badges")
@Data
public class Badge {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne @JoinColumn(name="user_id", nullable=false) private User user;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String icon;
    @Column(nullable = false) private LocalDate earnedDate;
}
"""

# Repositories
files['repository/GoalRepository.java'] = """package com.carbon.backend.repository;
import com.carbon.backend.model.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserId(Long userId);
}
"""

files['repository/BadgeRepository.java'] = """package com.carbon.backend.repository;
import com.carbon.backend.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByUserId(Long userId);
}
"""

# Controllers
files['controller/GoalController.java'] = """package com.carbon.backend.controller;
import com.carbon.backend.model.Goal;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.GoalRepository;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/goals")
public class GoalController {
    @Autowired private GoalRepository goalRepo;
    @Autowired private UserRepository userRepo;

    @GetMapping
    public ResponseEntity<?> getGoals(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(goalRepo.findByUserId(user.getId()));
    }

    @PostMapping
    public ResponseEntity<?> addGoal(@RequestBody Goal goal, Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        goal.setUser(user);
        if (goal.getStatus() == null) goal.setStatus("IN_PROGRESS");
        return ResponseEntity.ok(goalRepo.save(goal));
    }
}
"""

files['controller/BadgeController.java'] = """package com.carbon.backend.controller;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.BadgeRepository;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/badges")
public class BadgeController {
    @Autowired private BadgeRepository badgeRepo;
    @Autowired private UserRepository userRepo;

    @GetMapping
    public ResponseEntity<?> getBadges(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(badgeRepo.findByUserId(user.getId()));
    }
}
"""

files['controller/AnalyticsController.java'] = """package com.carbon.backend.controller;
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
    public ResponseEntity<?> getSummary(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        List<ActivityLog> logs = activityRepo.findByUserId(user.getId());
        
        Map<String, Double> categoryTotals = logs.stream()
            .collect(Collectors.groupingBy(ActivityLog::getCategory, Collectors.summingDouble(ActivityLog::getEmissionsKgCo2)));
            
        double totalEmissions = logs.stream().mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
        
        List<Map<String, Object>> chartData = new ArrayList<>();
        categoryTotals.forEach((cat, val) -> {
            chartData.add(Map.of("name", cat, "value", val));
        });

        return ResponseEntity.ok(Map.of(
            "totalEmissions", totalEmissions,
            "chartData", chartData,
            "recentActivityCount", logs.size()
        ));
    }
}
"""

files['controller/UserController.java'] = """package com.carbon.backend.controller;
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

@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired private UserRepository userRepo;
    @Autowired private ActivityLogRepository activityRepo;

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody Map<String, String> settings, Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        if (settings.containsKey("sustainabilityPreference")) {
            user.setSustainabilityPreference(settings.get("sustainabilityPreference"));
        }
        return ResponseEntity.ok(userRepo.save(user));
    }
    
    @GetMapping("/leaderboard")
    public ResponseEntity<?> getLeaderboard() {
        List<User> users = userRepo.findAll();
        List<Map<String, Object>> leaderboard = users.stream().map(u -> {
            List<ActivityLog> logs = activityRepo.findByUserId(u.getId());
            double total = logs.stream().mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
            return Map.of("username", u.getUsername(), "totalEmissions", total, "logsCount", logs.size());
        })
        .sorted((a, b) -> Double.compare((Double)a.get("totalEmissions"), (Double)b.get("totalEmissions")))
        .limit(10)
        .collect(Collectors.toList());
        return ResponseEntity.ok(leaderboard);
    }
}
"""

for rel_path, content in files.items():
    with open(os.path.join(base_dir, rel_path), "w") as f:
        f.write(content)
print("Generated Backend API Features")
