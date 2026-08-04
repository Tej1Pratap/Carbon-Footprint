package com.carbon.backend.controller;

import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/activities")
public class AdminActivityController {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getAllActivities() {
        return ResponseEntity.ok(activityLogRepository.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteActivity(@PathVariable Long id) {
        return activityLogRepository.findById(id).map(activity -> {
            activityLogRepository.delete(activity);
            return ResponseEntity.ok(Map.of("message", "Activity deleted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/bulk-action")
    public ResponseEntity<?> bulkAction(@RequestBody Map<String, Object> body) {
        String action = (String) body.get("action");
        List<Integer> ids = (List<Integer>) body.get("ids");
        
        for (Integer id : ids) {
            if ("DELETE".equals(action)) {
                activityLogRepository.deleteById(id.longValue());
            }
        }
        return ResponseEntity.ok(Map.of("message", "Bulk action executed successfully"));
    }
}
