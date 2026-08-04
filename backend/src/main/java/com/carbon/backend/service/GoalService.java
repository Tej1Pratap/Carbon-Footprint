package com.carbon.backend.service;

import com.carbon.backend.event.GoalAchievedEvent;
import com.carbon.backend.event.ActivityLoggedEvent;
import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.Goal;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.repository.GoalRepository;
import com.carbon.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepo;

    @Autowired
    private ActivityLogRepository activityRepo;
    
    @Autowired
    private ApplicationEventPublisher eventPublisher;
    
    @Autowired
    private NotificationRepository notificationRepo;

    @Autowired
    private com.carbon.backend.repository.UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private RecommendationEngine recommendationEngine;

    public Goal createGoal(User user, Goal goalRequest) {
        goalRequest.setUser(user);
        goalRequest.setStartDate(LocalDate.now());
        goalRequest.setStatus("IN_PROGRESS");
        
        int period = goalRequest.getPeriodDays() != null ? goalRequest.getPeriodDays() : 30;
        goalRequest.setPeriodDays(period);
        goalRequest.setDeadline(LocalDate.now().plusDays(period));

        if (goalRequest.getTargetReductionPercentage() != null) {
            // Calculate baseline emissions (previous 'period' days)
            LocalDate baselineStart = LocalDate.now().minusDays(period);
            List<ActivityLog> allLogs = activityRepo.findByUserId(user.getId());
            double baseline = allLogs.stream()
                .filter(log -> log.getLogDate() != null && log.getLogDate().toLocalDate().isAfter(baselineStart) && log.getLogDate().toLocalDate().isBefore(LocalDate.now().plusDays(1)))
                .mapToDouble(ActivityLog::getEmissionsKgCo2)
                .sum();
            
            goalRequest.setBaselineEmissions(baseline);
            
            // If baseline is 0, provide a sensible default target so the math doesn't break
            if (baseline == 0) {
                goalRequest.setTargetKgCo2(100.0); // Arbitrary fallback target
            } else {
                double target = baseline * (1.0 - (goalRequest.getTargetReductionPercentage() / 100.0));
                goalRequest.setTargetKgCo2(target);
            }
        }
        
        return goalRepo.save(goalRequest);
    }

    public List<Map<String, Object>> getEnrichedGoals(User user) {
        List<Goal> goals = goalRepo.findByUserId(user.getId());
        List<Map<String, Object>> enrichedGoals = new ArrayList<>();
        List<ActivityLog> allLogs = activityRepo.findByUserId(user.getId());

        for (Goal g : goals) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", g.getId());
            map.put("description", g.getDescription());
            map.put("targetKgCo2", g.getTargetKgCo2());
            map.put("deadline", g.getDeadline());
            map.put("status", g.getStatus());
            map.put("startDate", g.getStartDate());
            map.put("periodDays", g.getPeriodDays());
            map.put("baselineEmissions", g.getBaselineEmissions());
            map.put("targetReductionPercentage", g.getTargetReductionPercentage());

            if (g.getStartDate() != null && "IN_PROGRESS".equals(g.getStatus())) {
                double currentEmissions = allLogs.stream()
                    .filter(log -> log.getLogDate() != null && !log.getLogDate().toLocalDate().isBefore(g.getStartDate()))
                    .mapToDouble(ActivityLog::getEmissionsKgCo2)
                    .sum();
                
                long daysElapsed = ChronoUnit.DAYS.between(g.getStartDate(), LocalDate.now());
                if (daysElapsed == 0) daysElapsed = 1; // Prevent div by zero on day 1
                
                double projectedEmissions = (currentEmissions / daysElapsed) * g.getPeriodDays();
                double progressPercentage = g.getTargetKgCo2() > 0 ? Math.min(100, (currentEmissions / g.getTargetKgCo2()) * 100) : 0;
                
                String projectedStatus = projectedEmissions > g.getTargetKgCo2() ? "AT_RISK" : "ON_TRACK";
                String alertMessage = projectedStatus.equals("ON_TRACK") ? 
                    "Great job! You are currently on track to beat your reduction goal." : 
                    "Watch out! At this rate, you will exceed your target emissions. Try to reduce your daily carbon footprint.";
                
                if (LocalDate.now().isAfter(g.getDeadline())) {
                    projectedStatus = currentEmissions <= g.getTargetKgCo2() ? "ACHIEVED" : "FAILED";
                    alertMessage = projectedStatus.equals("ACHIEVED") ? "Goal achieved successfully!" : "Goal failed. You exceeded your target.";
                    g.setStatus(projectedStatus);
                    goalRepo.save(g);
                    
                    if (projectedStatus.equals("ACHIEVED")) {
                        double kgSaved = g.getBaselineEmissions() != null ? Math.max(0, g.getBaselineEmissions() - currentEmissions) : 0.0;
                        eventPublisher.publishEvent(new GoalAchievedEvent(this, user, g, kgSaved));
                    }
                }
                
                // --- Notification Logic ---
                // We notify if the status has flipped, or if they haven't been notified yet.
                if (g.getLastNotifiedStatus() == null || !g.getLastNotifiedStatus().equals(projectedStatus)) {
                    // Prevent spamming "IN_PROGRESS" or "ON_TRACK" immediately upon creation unless it flips to AT_RISK
                    if (g.getLastNotifiedStatus() != null || projectedStatus.equals("AT_RISK") || projectedStatus.equals("ON_TRACK") || projectedStatus.equals("ACHIEVED") || projectedStatus.equals("FAILED")) {
                        com.carbon.backend.model.Notification notification = new com.carbon.backend.model.Notification();
                        notification.setUser(user);
                        notification.setType("GOAL_ALERT");
                        
                        if (projectedStatus.equals("AT_RISK")) {
                            notification.setMessage("⚠️ Goal Alert: You are currently AT RISK of missing your goal '" + g.getDescription() + "'.");
                        } else if (projectedStatus.equals("ON_TRACK")) {
                            notification.setMessage("✅ Great job! You are ON TRACK for your goal '" + g.getDescription() + "'. Keep it up!");
                        } else if (projectedStatus.equals("ACHIEVED")) {
                            notification.setMessage("🏆 Goal Achieved! You successfully completed your goal '" + g.getDescription() + "'.");
                        } else if (projectedStatus.equals("FAILED")) {
                            notification.setMessage("❌ Goal Failed: You exceeded the target for '" + g.getDescription() + "'. Don't give up, try again!");
                        }
                        
                        notificationRepo.save(notification);

                        try {
                            List<Map<String, String>> recs = recommendationEngine.generateRecommendations(user);
                            emailService.sendGoalStatusEmail(user.getEmail(), user.getUsername(), g, projectedStatus, recs);
                        } catch(Exception e) {
                            System.err.println("Failed to trigger goal email: " + e.getMessage());
                        }
                    }
                    g.setLastNotifiedStatus(projectedStatus);
                    goalRepo.save(g);
                }

                map.put("currentEmissions", currentEmissions);
                map.put("projectedEmissions", projectedEmissions);
                map.put("progressPercentage", progressPercentage);
                map.put("projectedStatus", projectedStatus);
                map.put("alertMessage", alertMessage);
                map.put("status", g.getStatus());
            } else {
                // Legacy goals or completed goals
                map.put("currentEmissions", 0);
                map.put("progressPercentage", 0);
                map.put("projectedStatus", g.getStatus());
                map.put("alertMessage", "Goal is " + g.getStatus());
            }
            
            enrichedGoals.add(map);
        }
        
        return enrichedGoals;
    }

    @EventListener
    public void onActivityLogged(ActivityLoggedEvent event) {
        // Evaluate goals to trigger any necessary state changes or notifications immediately
        getEnrichedGoals(event.getUser());
    }

    public List<Map<String, Object>> getAllEnrichedGoals() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> allEnriched = new ArrayList<>();
        for (User u : users) {
            List<Map<String, Object>> userGoals = getEnrichedGoals(u);
            for(Map<String, Object> g : userGoals) {
                g.put("username", u.getUsername());
                g.put("userEmail", u.getEmail());
                allEnriched.add(g);
            }
        }
        return allEnriched;
    }

    public List<Map<String, Object>> getGlobalRecommendations() {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> allRecs = new ArrayList<>();
        for (User u : users) {
            try {
                List<Map<String, String>> userRecs = recommendationEngine.generateRecommendations(u);
                for (Map<String, String> rec : userRecs) {
                    Map<String, Object> enrichedRec = new HashMap<>();
                    enrichedRec.put("username", u.getUsername());
                    enrichedRec.put("userEmail", u.getEmail());
                    enrichedRec.put("type", rec.get("type"));
                    enrichedRec.put("tip", rec.get("tip"));
                    allRecs.add(enrichedRec);
                }
            } catch (Exception e) {}
        }
        return allRecs;
    }
}
