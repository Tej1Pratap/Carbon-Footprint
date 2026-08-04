package com.carbon.backend.controller;

import com.carbon.backend.event.ActivityLoggedEvent;
import com.carbon.backend.event.GoalAchievedEvent;
import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.Goal;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired private ApplicationEventPublisher eventPublisher;
    @Autowired private UserRepository userRepo;
    @Autowired private ActivityLogRepository activityRepo;

    @PostMapping("/simulate-badges")
    public ResponseEntity<?> simulateBadges(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();

        // 1. Simulate 7 consecutive days of logs
        for (int i = 6; i >= 0; i--) {
            ActivityLog log = new ActivityLog();
            log.setUser(user);
            log.setCategory("Test");
            log.setActivityType("Test Activity");
            log.setEmissionsKgCo2(1.0);
            log.setLogDate(LocalDateTime.now().minusDays(i));
            activityRepo.save(log);
        }
        
        // Trigger the Activity Logged Event to evaluate streak
        ActivityLog dummyLog = new ActivityLog();
        dummyLog.setLogDate(LocalDateTime.now());
        eventPublisher.publishEvent(new ActivityLoggedEvent(this, user, dummyLog));

        // 2. Simulate Goal Achieved Event with 60kg saved (triggers First Goal, Bronze, Silver, Gold)
        Goal dummyGoal = new Goal();
        dummyGoal.setDescription("Simulated Goal");
        eventPublisher.publishEvent(new GoalAchievedEvent(this, user, dummyGoal, 60.0));

        return ResponseEntity.ok("Simulated 7 days of logs and a 60kg goal achievement. Badges should be awarded!");
    }
}
