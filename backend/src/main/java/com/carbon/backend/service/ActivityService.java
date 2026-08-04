package com.carbon.backend.service;
import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.repository.UserRepository;
import com.carbon.backend.event.ActivityLoggedEvent;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityService {
    @Autowired private ActivityLogRepository activityRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private EmissionEngine emissionEngine;
    @Autowired private ApplicationEventPublisher eventPublisher;

    public ActivityLog logActivity(String email, ActivityLog log) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        double emissions = emissionEngine.calculateEmissions(log.getCategory(), log.getActivityType(), log.getUnit(), log.getQuantity());
        log.setUser(user);
        log.setEmissionsKgCo2(emissions);
        log.setLogDate(LocalDateTime.now());
        ActivityLog savedLog = activityRepo.save(log);
        
        // Publish event for decoupled processing (like Badge awarding)
        eventPublisher.publishEvent(new ActivityLoggedEvent(this, user, savedLog));
        
        return savedLog;
    }
    
    public List<ActivityLog> getUserLogs(String email) {
        User user = userRepo.findByEmail(email).orElseThrow();
        return activityRepo.findByUserId(user.getId());
    }
}
