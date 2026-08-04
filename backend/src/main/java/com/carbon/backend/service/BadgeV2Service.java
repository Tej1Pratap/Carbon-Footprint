package com.carbon.backend.service;

import com.carbon.backend.dto.BadgeV2DTOs.DynamicBadgeStatus;
import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.IsoFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BadgeV2Service {

    @Autowired private ActivityLogRepository activityLogRepository;
    @Autowired private UserRepository userRepository;

    public List<DynamicBadgeStatus> calculateDynamicBadges(Long userId) {
        List<ActivityLog> logs = activityLogRepository.findByUserId(userId);
        List<DynamicBadgeStatus> statuses = new ArrayList<>();

        // Helper maps
        Map<String, List<ActivityLog>> logsByWeek = new HashMap<>();
        Map<String, List<ActivityLog>> logsByMonth = new HashMap<>();
        Map<Integer, List<ActivityLog>> logsByYear = new HashMap<>();

        for (ActivityLog log : logs) {
            LocalDate d = log.getLogDate().toLocalDate();
            int year = d.getYear();
            int week = d.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
            String weekKey = year + "-W" + week;
            String monthKey = year + "-" + String.format("%02d", d.getMonthValue());
            
            logsByWeek.computeIfAbsent(weekKey, k -> new ArrayList<>()).add(log);
            logsByMonth.computeIfAbsent(monthKey, k -> new ArrayList<>()).add(log);
            logsByYear.computeIfAbsent(year, k -> new ArrayList<>()).add(log);
        }

        LocalDate now = LocalDate.now();
        String currentWeekKey = now.getYear() + "-W" + now.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        String currentMonthKey = now.getYear() + "-" + String.format("%02d", now.getMonthValue());
        int currentYear = now.getYear();

        // 1. Weekly Starter (3 activities/week)
        statuses.add(evaluateActivityCount("b1", "Weekly Starter", logsByWeek, currentWeekKey, 3));

        // 2. Weekly Champion (<30kg CO2/week, min 3 activities)
        statuses.add(evaluateEmissionLimit("b2", "Weekly Champion", logsByWeek, currentWeekKey, 30.0, 3));

        // 3. Monthly Consistent (15 activities/month)
        statuses.add(evaluateActivityCount("b3", "Monthly Consistent", logsByMonth, currentMonthKey, 15));

        // 4. Monthly Master (<150kg CO2/month, min 15 activities)
        statuses.add(evaluateEmissionLimit("b4", "Monthly Master", logsByMonth, currentMonthKey, 150.0, 15));

        // 5. Yearly Eco Warrior (100 activities/year)
        statuses.add(evaluateActivityCountYear("b5", "Yearly Eco Warrior", logsByYear, currentYear, 100));

        // 6. Yearly Climate Hero (<1500kg CO2/year, min 100 activities)
        statuses.add(evaluateEmissionLimitYear("b6", "Yearly Climate Hero", logsByYear, currentYear, 1500.0, 100));

        return statuses;
    }

    private DynamicBadgeStatus evaluateActivityCount(String id, String name, Map<String, List<ActivityLog>> grouped, String currentKey, int target) {
        int count = 0;
        LocalDateTime lastEarned = null;
        for (Map.Entry<String, List<ActivityLog>> entry : grouped.entrySet()) {
            if (entry.getValue().size() >= target) {
                count++;
                LocalDateTime d = entry.getValue().get(entry.getValue().size()-1).getLogDate();
                if (lastEarned == null || d.isAfter(lastEarned)) lastEarned = d;
            }
        }
        
        List<ActivityLog> currentLogs = grouped.getOrDefault(currentKey, new ArrayList<>());
        int currentProgress = currentLogs.size();
        
        DynamicBadgeStatus status = new DynamicBadgeStatus();
        status.setId(id);
        status.setName(name);
        status.setEarnedCount(count);
        status.setCurrentProgress(currentProgress);
        status.setCurrentTarget(target);
        status.setLastEarnedDate(lastEarned);
        
        if (currentProgress >= target) {
            status.setCurrentStatus("ACTIVE");
        } else {
            status.setCurrentStatus(count > 0 ? "WARNING" : "LOCKED");
        }
        return status;
    }

    private DynamicBadgeStatus evaluateEmissionLimit(String id, String name, Map<String, List<ActivityLog>> grouped, String currentKey, double limit, int minActivities) {
        int count = 0;
        LocalDateTime lastEarned = null;
        for (Map.Entry<String, List<ActivityLog>> entry : grouped.entrySet()) {
            double total = entry.getValue().stream().mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
            if (entry.getValue().size() >= minActivities && total <= limit) {
                count++;
                LocalDateTime d = entry.getValue().get(entry.getValue().size()-1).getLogDate();
                if (lastEarned == null || d.isAfter(lastEarned)) lastEarned = d;
            }
        }

        List<ActivityLog> currentLogs = grouped.getOrDefault(currentKey, new ArrayList<>());
        double currentTotal = currentLogs.stream().mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
        
        DynamicBadgeStatus status = new DynamicBadgeStatus();
        status.setId(id);
        status.setName(name);
        status.setEarnedCount(count);
        status.setCurrentProgress(currentTotal);
        status.setCurrentTarget(limit);
        status.setLastEarnedDate(lastEarned);

        if (currentTotal > limit) {
            status.setCurrentStatus(count > 0 ? "WARNING" : "LOCKED");
        } else {
            if (count > 0) {
                status.setCurrentStatus("ACTIVE"); // Earned historically, hasn't failed this period
            } else if (currentLogs.size() >= minActivities) {
                status.setCurrentStatus("ACTIVE"); // Just earned it this period
            } else {
                status.setCurrentStatus("LOCKED");
            }
        }
        return status;
    }
    
    // Year variants (same logic, different map key type)
    private DynamicBadgeStatus evaluateActivityCountYear(String id, String name, Map<Integer, List<ActivityLog>> grouped, int currentKey, int target) {
        Map<String, List<ActivityLog>> strGrouped = new HashMap<>();
        grouped.forEach((k, v) -> strGrouped.put(String.valueOf(k), v));
        return evaluateActivityCount(id, name, strGrouped, String.valueOf(currentKey), target);
    }
    
    private DynamicBadgeStatus evaluateEmissionLimitYear(String id, String name, Map<Integer, List<ActivityLog>> grouped, int currentKey, double limit, int minActivities) {
        Map<String, List<ActivityLog>> strGrouped = new HashMap<>();
        grouped.forEach((k, v) -> strGrouped.put(String.valueOf(k), v));
        return evaluateEmissionLimit(id, name, strGrouped, String.valueOf(currentKey), limit, minActivities);
    }
}
