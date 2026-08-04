package com.carbon.backend.controller;
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
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(Authentication authentication) {
        return ResponseEntity.ok(activityService.getUserLogs(authentication.getName()));
    }
}
