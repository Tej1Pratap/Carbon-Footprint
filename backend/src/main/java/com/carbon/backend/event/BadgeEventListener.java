package com.carbon.backend.event;

import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.Badge;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.repository.BadgeRepository;
import com.carbon.backend.repository.UserRepository;
import com.carbon.backend.repository.NotificationRepository;
import com.carbon.backend.model.Notification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class BadgeEventListener {

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private ActivityLogRepository activityRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationRepository notificationRepository;

    @EventListener
    public void handleActivityLogged(ActivityLoggedEvent event) {
        User user = event.getUser();
        List<ActivityLog> logs = activityRepository.findByUserId(user.getId());
        List<String> currentBadges = badgeRepository.findByUserId(user.getId())
                .stream().map(Badge::getName).collect(Collectors.toList());

        // Check for 7-Day Streak
        if (!currentBadges.contains("7-Day Streak")) {
            Set<LocalDate> distinctDates = logs.stream()
                    .map(log -> log.getLogDate().toLocalDate())
                    .collect(Collectors.toSet());

            LocalDate today = LocalDate.now();
            int currentStreak = 0;
            
            // Check if streak is alive (logged today or yesterday)
            if (distinctDates.contains(today) || distinctDates.contains(today.minusDays(1))) {
                LocalDate checkDate = distinctDates.contains(today) ? today : today.minusDays(1);
                while (distinctDates.contains(checkDate)) {
                    currentStreak++;
                    checkDate = checkDate.minusDays(1);
                }
            }

            if (currentStreak >= 7) {
                awardBadge(user, "7-Day Streak", "fire", "text-orange-500");
            }
        }
    }

    @EventListener
    public void handleGoalAchieved(GoalAchievedEvent event) {
        User user = event.getUser();
        List<String> currentBadges = badgeRepository.findByUserId(user.getId())
                .stream().map(Badge::getName).collect(Collectors.toList());

        // Check for First Goal Achieved
        if (!currentBadges.contains("First Goal Achieved")) {
            awardBadge(user, "First Goal Achieved", "trophy", "text-yellow-500");
        }

        // Add saved kg to user total (if User entity is updated, or just calculate on the fly)
        // Since we didn't add the field to User yet, let's just use event.getKgSaved() and keep a running tally if possible, 
        // or just calculate total reductions dynamically if needed.
        // Actually, we'll update the User entity to track this for simplicity.
        double newTotalSaved = (user.getTotalKgSaved() != null ? user.getTotalKgSaved() : 0.0) + event.getKgSaved();
        user.setTotalKgSaved(newTotalSaved);
        userRepository.save(user);

        // Check Milestones
        if (newTotalSaved >= 10.0 && !currentBadges.contains("Bronze Reducer (10kg)")) {
            awardBadge(user, "Bronze Reducer (10kg)", "medal", "text-yellow-700");
        }
        if (newTotalSaved >= 25.0 && !currentBadges.contains("Silver Reducer (25kg)")) {
            awardBadge(user, "Silver Reducer (25kg)", "medal", "text-gray-400");
        }
        if (newTotalSaved >= 50.0 && !currentBadges.contains("Gold Reducer (50kg)")) {
            awardBadge(user, "Gold Reducer (50kg)", "medal", "text-yellow-400");
        }
    }

    private void awardBadge(User user, String name, String icon, String colorClass) {
        Badge badge = new Badge();
        badge.setUser(user);
        badge.setName(name);
        badge.setIcon(icon);
        // We'll map colors on frontend or just use basic icons
        badge.setEarnedDate(LocalDate.now());
        badgeRepository.save(badge);
        System.out.println("Event-Driven Badge Awarded to " + user.getUsername() + ": " + name);
        
        // Generate a Notification
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType("BADGE");
        notification.setMessage("Congratulations! You earned the '" + name + "' badge. Check your profile to see it.");
        notificationRepository.save(notification);
    }
}
