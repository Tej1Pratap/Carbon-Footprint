package com.carbon.backend.service;

import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationEngine {

    @Autowired
    private ActivityLogRepository activityRepo;

    public List<Map<String, String>> generateRecommendations(User user) {
        List<ActivityLog> allLogs = activityRepo.findByUserId(user.getId());
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        // Filter last 30 days
        List<ActivityLog> recentLogs = allLogs.stream()
                .filter(log -> log.getLogDate() != null && log.getLogDate().isAfter(thirtyDaysAgo))
                .collect(Collectors.toList());

        // Group by Activity Type and sum emissions
        Map<String, Double> emissionsByType = recentLogs.stream()
                .collect(Collectors.groupingBy(ActivityLog::getActivityType, Collectors.summingDouble(ActivityLog::getEmissionsKgCo2)));

        // Sort by highest emissions
        List<Map.Entry<String, Double>> topEmissions = emissionsByType.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue()))
                .limit(3)
                .collect(Collectors.toList());

        List<Map<String, String>> recommendations = new ArrayList<>();

        if (topEmissions.isEmpty()) {
            recommendations.add(Map.of(
                    "type", "General",
                    "tip", "Start logging your daily activities to get personalized reduction tips!",
                    "icon", "lightbulb",
                    "color", "text-yellow-500"
            ));
            return recommendations;
        }

        for (Map.Entry<String, Double> entry : topEmissions) {
            recommendations.add(getTipForActivity(entry.getKey(), entry.getValue()));
        }

        return recommendations;
    }

    private Map<String, String> getTipForActivity(String activityType, double totalEmissions) {
        String lowerType = activityType.toLowerCase();
        Map<String, String> rec = new HashMap<>();
        rec.put("type", activityType);
        
        if (lowerType.contains("car") || lowerType.contains("driving")) {
            rec.put("tip", "You generated " + String.format("%.1f", totalEmissions) + "kg CO2 from driving. Try carpooling or taking public transit twice a week to cut this down.");
            rec.put("icon", "car");
            rec.put("color", "text-blue-500");
        } else if (lowerType.contains("flight") || lowerType.contains("air")) {
            rec.put("tip", "Flights contributed " + String.format("%.1f", totalEmissions) + "kg CO2. Opt for direct flights or consider purchasing carbon offsets for your trips.");
            rec.put("icon", "plane");
            rec.put("color", "text-sky-500");
        } else if (lowerType.contains("electric") || lowerType.contains("power")) {
            rec.put("tip", "Electricity usage emitted " + String.format("%.1f", totalEmissions) + "kg CO2. Switch to LED bulbs and unplug phantom power drains.");
            rec.put("icon", "bolt");
            rec.put("color", "text-yellow-500");
        } else if (lowerType.contains("meat") || lowerType.contains("beef") || lowerType.contains("food")) {
            rec.put("tip", "Food choices produced " + String.format("%.1f", totalEmissions) + "kg CO2. Incorporating one plant-based meal a day can drastically reduce this.");
            rec.put("icon", "utensils");
            rec.put("color", "text-red-500");
        } else if (lowerType.contains("gas") || lowerType.contains("heat")) {
            rec.put("tip", "Heating/Gas accounted for " + String.format("%.1f", totalEmissions) + "kg CO2. Try lowering your thermostat by 1 degree to save energy.");
            rec.put("icon", "fire");
            rec.put("color", "text-orange-500");
        } else if (lowerType.contains("water")) {
            rec.put("tip", "Water usage emitted " + String.format("%.1f", totalEmissions) + "kg CO2. Install low-flow showerheads to reduce water heating energy.");
            rec.put("icon", "tint");
            rec.put("color", "text-cyan-500");
        } else {
            rec.put("tip", "Your " + activityType + " activities generated " + String.format("%.1f", totalEmissions) + "kg CO2. Review these activities to find efficiency opportunities.");
            rec.put("icon", "leaf");
            rec.put("color", "text-green-500");
        }
        
        return rec;
    }
}
