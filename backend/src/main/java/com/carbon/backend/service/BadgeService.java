package com.carbon.backend.service;

import com.carbon.backend.model.Badge;
import com.carbon.backend.model.User;
import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.Goal;
import com.carbon.backend.repository.BadgeRepository;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.context.event.EventListener;
import com.carbon.backend.event.ActivityLoggedEvent;
import com.carbon.backend.event.GoalAchievedEvent;
import com.carbon.backend.model.Notification;
import com.carbon.backend.repository.NotificationRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BadgeService {

    @Autowired
    private BadgeRepository badgeRepo;

    @Autowired
    private ActivityLogRepository activityRepo;

    @Autowired
    private GoalRepository goalRepo;

    @Autowired
    private NotificationRepository notificationRepo;

    @Autowired
    private EmailService emailService;

    @EventListener
    public void onActivityLogged(ActivityLoggedEvent event) {
        checkAndAwardBadges(event.getUser());
    }

    @EventListener
    public void onGoalAchieved(GoalAchievedEvent event) {
        checkAndAwardBadges(event.getUser());
    }

    public void checkAndAwardBadges(User user) {
        List<ActivityLog> logs = activityRepo.findByUserId(user.getId());
        List<Badge> currentBadges = badgeRepo.findByUserId(user.getId());
        List<String> currentBadgeNames = currentBadges.stream()
                .map(Badge::getName)
                .collect(Collectors.toList());

        int weeklyCount = (int) logs.stream().filter(l -> l.getLogDate().isAfter(java.time.LocalDateTime.now().minusWeeks(1))).count();
        int monthlyCount = (int) logs.stream().filter(l -> l.getLogDate().isAfter(java.time.LocalDateTime.now().minusMonths(1))).count();
        int yearlyCount = (int) logs.stream().filter(l -> l.getLogDate().isAfter(java.time.LocalDateTime.now().minusYears(1))).count();

        double weeklyEmissions = logs.stream().filter(l -> l.getLogDate().isAfter(java.time.LocalDateTime.now().minusWeeks(1)))
                .mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
        double monthlyEmissions = logs.stream().filter(l -> l.getLogDate().isAfter(java.time.LocalDateTime.now().minusMonths(1)))
                .mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
        double yearlyEmissions = logs.stream().filter(l -> l.getLogDate().isAfter(java.time.LocalDateTime.now().minusYears(1)))
                .mapToDouble(ActivityLog::getEmissionsKgCo2).sum();

        // Weekly Badges
        if (weeklyCount >= 3 && !currentBadgeNames.contains("Weekly Starter")) {
            awardBadge(user, "Weekly Starter", "leaf");
        }
        // To be a Weekly Champion, you must actively log (>=3 times) AND stay under 30kg
        if (weeklyCount >= 3 && weeklyEmissions <= 30 && !currentBadgeNames.contains("Weekly Champion")) {
            awardBadge(user, "Weekly Champion", "star");
        }

        // Monthly Badges
        if (monthlyCount >= 15 && !currentBadgeNames.contains("Monthly Consistent")) {
            awardBadge(user, "Monthly Consistent", "calendar-check");
        }
        // To be a Monthly Master, you must actively log (>=15 times) AND stay under 150kg
        if (monthlyCount >= 15 && monthlyEmissions <= 150 && !currentBadgeNames.contains("Monthly Master")) {
            awardBadge(user, "Monthly Master", "trophy");
        }

        // Yearly Badges
        if (yearlyCount >= 100 && !currentBadgeNames.contains("Yearly Eco Warrior")) {
            awardBadge(user, "Yearly Eco Warrior", "globe");
        }
        // To be a Yearly Climate Hero, you must actively log all year (>=100 times) AND stay under 1500kg
        if (yearlyCount >= 100 && yearlyEmissions <= 1500 && !currentBadgeNames.contains("Yearly Climate Hero")) {
            awardBadge(user, "Yearly Climate Hero", "shield-check");
        }

        // Goal Badges
        List<Goal> goals = goalRepo.findByUserId(user.getId());
        long achievedGoals = goals.stream().filter(g -> "ACHIEVED".equals(g.getStatus())).count();

        // 7. Goal Achiever (Complete 1 goal)
        if (achievedGoals >= 1 && !currentBadgeNames.contains("Goal Achiever")) {
            awardBadge(user, "Goal Achiever", "target");
        }

        // 8. Goal Crusher (Complete 5 goals)
        if (achievedGoals >= 5 && !currentBadgeNames.contains("Goal Crusher")) {
            awardBadge(user, "Goal Crusher", "award");
        }
    }

    private void awardBadge(User user, String name, String icon) {
        Badge badge = new Badge();
        badge.setUser(user);
        badge.setName(name);
        badge.setIcon(icon);
        badge.setEarnedDate(LocalDate.now());
        badgeRepo.save(badge);
        System.out.println("Awarded new badge to " + user.getUsername() + ": " + name);

        // Send Email
        emailService.sendBadgeEarnedEmail(user.getEmail(), user.getUsername(), name);

        // Create In-App Notification
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage("Congratulations! You earned the '" + name + "' badge!");
        notification.setType("BADGE");
        notificationRepo.save(notification);
    }
}
