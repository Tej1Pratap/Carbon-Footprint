package com.carbon.backend.controller;
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

    // --- Admin Endpoints ---

    @GetMapping("/all")
    public ResponseEntity<?> getAllBadges(Authentication auth) {
        User admin = userRepo.findByEmail(auth.getName()).orElseThrow();
        if (!"ADMIN".equals(admin.getRole())) return ResponseEntity.status(403).body("Access denied");
        return ResponseEntity.ok(badgeRepo.findAll());
    }

    @PostMapping("/award")
    public ResponseEntity<?> awardBadge(@RequestBody java.util.Map<String, String> payload, Authentication auth) {
        User admin = userRepo.findByEmail(auth.getName()).orElseThrow();
        if (!"ADMIN".equals(admin.getRole())) return ResponseEntity.status(403).body("Access denied");
        
        Long userId = Long.parseLong(payload.get("userId"));
        String name = payload.get("name");
        String icon = payload.get("icon");
        
        User targetUser = userRepo.findById(userId).orElseThrow();
        
        com.carbon.backend.model.Badge badge = new com.carbon.backend.model.Badge();
        badge.setUser(targetUser);
        badge.setName(name);
        badge.setIcon(icon);
        badge.setEarnedDate(java.time.LocalDate.now());
        
        badgeRepo.save(badge);
        return ResponseEntity.ok("Badge awarded successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBadge(@PathVariable Long id, Authentication auth) {
        User admin = userRepo.findByEmail(auth.getName()).orElseThrow();
        if (!"ADMIN".equals(admin.getRole())) return ResponseEntity.status(403).body("Access denied");
        
        if (badgeRepo.existsById(id)) {
            badgeRepo.deleteById(id);
            return ResponseEntity.ok("Badge revoked successfully");
        }
        return ResponseEntity.notFound().build();
    }
}
