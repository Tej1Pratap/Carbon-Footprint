package com.carbon.backend.controller;

import com.carbon.backend.model.User;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EntityManager entityManager;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        return userRepository.findById(id).map(user -> {
            if (updatedUser.getUsername() != null) user.setUsername(updatedUser.getUsername());
            if (updatedUser.getEmail() != null) user.setEmail(updatedUser.getEmail());
            if (updatedUser.getPhone() != null) user.setPhone(updatedUser.getPhone());
            if (updatedUser.getRole() != null) user.setRole(updatedUser.getRole());
            if (updatedUser.getStatus() != null) user.setStatus(updatedUser.getStatus());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            entityManager.createNativeQuery("DELETE FROM activity_logs WHERE user_id = :userId").setParameter("userId", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM badges WHERE user_id = :userId").setParameter("userId", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM goals WHERE user_id = :userId").setParameter("userId", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM email_verification_tokens WHERE user_id = :userId").setParameter("userId", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM password_reset_tokens WHERE user_id = :userId").setParameter("userId", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM notifications WHERE user_id = :userId").setParameter("userId", id).executeUpdate();
            entityManager.createNativeQuery("UPDATE support_tickets SET assigned_admin_id = NULL WHERE assigned_admin_id = :userId").setParameter("userId", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM support_replies WHERE ticket_id IN (SELECT ticket_id FROM support_tickets WHERE user_id = :userId)").setParameter("userId", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM support_ratings WHERE ticket_id IN (SELECT ticket_id FROM support_tickets WHERE user_id = :userId)").setParameter("userId", id).executeUpdate();
            entityManager.createNativeQuery("DELETE FROM support_tickets WHERE user_id = :userId").setParameter("userId", id).executeUpdate();
            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<?> resetUserPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newPassword = body.get("newPassword");
        return userRepository.findById(id).map(user -> {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/bulk-action")
    @Transactional
    public ResponseEntity<?> bulkAction(@RequestBody Map<String, Object> body) {
        String action = (String) body.get("action");
        List<Integer> ids = (List<Integer>) body.get("ids");
        
        for (Integer id : ids) {
            userRepository.findById(id.longValue()).ifPresent(user -> {
                if ("DELETE".equals(action)) {
                    entityManager.createNativeQuery("DELETE FROM activity_logs WHERE user_id = :userId").setParameter("userId", user.getId()).executeUpdate();
                    entityManager.createNativeQuery("DELETE FROM badges WHERE user_id = :userId").setParameter("userId", user.getId()).executeUpdate();
                    entityManager.createNativeQuery("DELETE FROM goals WHERE user_id = :userId").setParameter("userId", user.getId()).executeUpdate();
                    entityManager.createNativeQuery("DELETE FROM email_verification_tokens WHERE user_id = :userId").setParameter("userId", user.getId()).executeUpdate();
                    entityManager.createNativeQuery("DELETE FROM password_reset_tokens WHERE user_id = :userId").setParameter("userId", user.getId()).executeUpdate();
                    entityManager.createNativeQuery("DELETE FROM notifications WHERE user_id = :userId").setParameter("userId", user.getId()).executeUpdate();
                    entityManager.createNativeQuery("UPDATE support_tickets SET assigned_admin_id = NULL WHERE assigned_admin_id = :userId").setParameter("userId", user.getId()).executeUpdate();
                    entityManager.createNativeQuery("DELETE FROM support_replies WHERE ticket_id IN (SELECT ticket_id FROM support_tickets WHERE user_id = :userId)").setParameter("userId", user.getId()).executeUpdate();
                    entityManager.createNativeQuery("DELETE FROM support_ratings WHERE ticket_id IN (SELECT ticket_id FROM support_tickets WHERE user_id = :userId)").setParameter("userId", user.getId()).executeUpdate();
                    entityManager.createNativeQuery("DELETE FROM support_tickets WHERE user_id = :userId").setParameter("userId", user.getId()).executeUpdate();
                    userRepository.delete(user);
                } else if ("DEACTIVATE".equals(action)) {
                    user.setStatus("INACTIVE");
                    userRepository.save(user);
                } else if ("ACTIVATE".equals(action)) {
                    user.setStatus("ACTIVE");
                    userRepository.save(user);
                }
            });
        }
        return ResponseEntity.ok(Map.of("message", "Bulk action executed successfully"));
    }
}
