package com.carbon.backend.controller;

import com.carbon.backend.model.Notification;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.NotificationRepository;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepo;

    @Autowired
    private UserRepository userRepo;

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(notificationRepo.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id, Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        Notification notification = notificationRepo.findById(id).orElseThrow();
        
        if (!notification.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Unauthorized");
        }
        
        notification.setRead(true);
        notificationRepo.save(notification);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        List<Notification> unread = notificationRepo.findByUserIdAndIsReadFalse(user.getId());
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepo.saveAll(unread);
        return ResponseEntity.ok().build();
    }
}
