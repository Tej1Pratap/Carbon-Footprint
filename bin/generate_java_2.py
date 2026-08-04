import os

base_dir = r"c:\Users\Admin\OneDrive\Desktop\Carbon Footprint\backend\src\main\java\com\carbon\backend"
files = {}

# Services
files['service/UserService.java'] = """package com.carbon.backend.service;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) throw new RuntimeException("Email is already in use!");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
"""

files['service/EmissionEngine.java'] = """package com.carbon.backend.service;
import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.EmissionFactor;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.repository.EmissionFactorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmissionEngine {
    @Autowired private EmissionFactorRepository factorRepo;
    
    public double calculateEmissions(String category, String type, String unit, double quantity) {
        EmissionFactor factor = factorRepo.findByCategoryAndActivityTypeAndUnit(category, type, unit)
                .orElseThrow(() -> new RuntimeException("Emission factor not found for: " + category + " " + type));
        return factor.getKgCo2PerUnit() * quantity;
    }
}
"""

files['service/ActivityService.java'] = """package com.carbon.backend.service;
import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityService {
    @Autowired private ActivityLogRepository activityRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private EmissionEngine emissionEngine;

    public ActivityLog logActivity(String email, ActivityLog log) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        double emissions = emissionEngine.calculateEmissions(log.getCategory(), log.getActivityType(), log.getUnit(), log.getQuantity());
        log.setUser(user);
        log.setEmissionsKgCo2(emissions);
        log.setLogDate(LocalDateTime.now());
        return activityRepo.save(log);
    }
    
    public List<ActivityLog> getUserLogs(String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        return activityRepo.findByUserId(user.getId());
    }
}
"""

# Controllers
files['controller/AuthController.java'] = """package com.carbon.backend.controller;
import com.carbon.backend.model.User;
import com.carbon.backend.service.UserService;
import com.carbon.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.carbon.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired private UserService userService;
    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try { return ResponseEntity.ok(userService.registerUser(user)); } 
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        User user = userRepo.findByEmail(email).orElse(null);
        if (user != null && passwordEncoder.matches(loginData.get("password"), user.getPassword())) {
            String token = jwtUtil.generateJwtToken(email);
            return ResponseEntity.ok(Map.of("token", token, "user", user));
        }
        return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
    }
    
    @PostMapping("/forget-password")
    public ResponseEntity<?> forgetPassword(@RequestBody Map<String, String> data) {
        try { 
            userService.resetPassword(data.get("email"), data.get("newPassword"));
            return ResponseEntity.ok(Map.of("message", "Password reset successful"));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }
}
"""

files['controller/ActivityController.java'] = """package com.carbon.backend.controller;
import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {
    @Autowired private ActivityService activityService;

    @PostMapping("/log")
    public ResponseEntity<?> logActivity(@RequestBody ActivityLog log, Authentication authentication) {
        try {
            return ResponseEntity.ok(activityService.logActivity(authentication.getName(), log));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(Authentication authentication) {
        return ResponseEntity.ok(activityService.getUserLogs(authentication.getName()));
    }
}
"""

for rel_path, content in files.items():
    with open(os.path.join(base_dir, rel_path), "w") as f:
        f.write(content)
print("Generated Part 2")
