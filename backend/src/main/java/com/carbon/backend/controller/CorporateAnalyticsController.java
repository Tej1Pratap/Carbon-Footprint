package com.carbon.backend.controller;

import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.Organization;
import com.carbon.backend.model.OrganizationMember;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.repository.OrganizationMemberRepository;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/corporate/analytics")
public class CorporateAnalyticsController {

    @Autowired private ActivityLogRepository activityLogRepo;
    @Autowired private OrganizationMemberRepository memberRepo;
    @Autowired private UserRepository userRepo;

    private Organization getMyOrgAsAdmin(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        OrganizationMember member = memberRepo.findByUserIdAndActiveTrue(user.getId())
            .orElseThrow(() -> new RuntimeException("Organization not found"));
            
        if (!"ORG_ADMIN".equals(member.getRole()) && !"CSR_MANAGER".equals(member.getRole())) {
            throw new RuntimeException("Access denied: Insufficient permissions");
        }
        return member.getOrganization();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            List<ActivityLog> allLogs = activityLogRepo.findByOrganizationId(org.getId());
            List<OrganizationMember> members = memberRepo.findByOrganizationIdAndActiveTrue(org.getId());
            
            double totalEmissions = allLogs.stream().mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
            
            LocalDateTime startOfThisMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
            LocalDateTime startOfLastMonth = startOfThisMonth.minusMonths(1);
            
            double thisMonthEmissions = allLogs.stream()
                .filter(l -> l.getLogDate().isAfter(startOfThisMonth))
                .mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
                
            double lastMonthEmissions = allLogs.stream()
                .filter(l -> l.getLogDate().isAfter(startOfLastMonth) && l.getLogDate().isBefore(startOfThisMonth))
                .mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
                
            double reductionPercent = 0.0;
            if (lastMonthEmissions > 0) {
                reductionPercent = ((lastMonthEmissions - thisMonthEmissions) / lastMonthEmissions) * 100;
            }
            
            int totalEmployees = members.size();
            double co2PerEmployee = totalEmployees > 0 ? totalEmissions / totalEmployees : 0;
            
            // Category Breakdown
            Map<String, Double> byCategory = allLogs.stream()
                .collect(Collectors.groupingBy(ActivityLog::getCategory, Collectors.summingDouble(ActivityLog::getEmissionsKgCo2)));
                
            // Monthly Trend (last 6 months)
            Map<String, Double> monthlyTrendMap = new TreeMap<>();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
            for (int i = 5; i >= 0; i--) {
                LocalDateTime d = LocalDateTime.now().minusMonths(i);
                monthlyTrendMap.put(d.format(formatter), 0.0);
            }
            
            for (ActivityLog log : allLogs) {
                String monthKey = log.getLogDate().format(formatter);
                if (monthlyTrendMap.containsKey(monthKey)) {
                    monthlyTrendMap.put(monthKey, monthlyTrendMap.get(monthKey) + log.getEmissionsKgCo2());
                }
            }
            
            List<Map<String, Object>> trendChart = new ArrayList<>();
            for (Map.Entry<String, Double> entry : monthlyTrendMap.entrySet()) {
                trendChart.add(Map.of("name", entry.getKey(), "emissions", entry.getValue()));
            }
            
            return ResponseEntity.ok(Map.of(
                "kpis", Map.of(
                    "totalEmissions", totalEmissions,
                    "thisMonthEmissions", thisMonthEmissions,
                    "reductionPercent", reductionPercent,
                    "co2PerEmployee", co2PerEmployee,
                    "totalEmployees", totalEmployees
                ),
                "categoryBreakdown", byCategory,
                "monthlyTrend", trendChart
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/departments")
    public ResponseEntity<?> getDepartmentComparison(Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            List<ActivityLog> allLogs = activityLogRepo.findByOrganizationId(org.getId());
            List<OrganizationMember> members = memberRepo.findByOrganizationIdAndActiveTrue(org.getId());
            
            // Map userId to department name
            Map<Long, String> userDeptMap = new HashMap<>();
            for (OrganizationMember member : members) {
                String deptName = member.getDepartment() != null ? member.getDepartment().getName() : "Unassigned";
                userDeptMap.put(member.getUser().getId(), deptName);
            }
            
            // Group emissions by department
            Map<String, Double> deptEmissions = new HashMap<>();
            for (ActivityLog log : allLogs) {
                String deptName = userDeptMap.getOrDefault(log.getUser().getId(), "Unassigned");
                deptEmissions.put(deptName, deptEmissions.getOrDefault(deptName, 0.0) + log.getEmissionsKgCo2());
            }
            
            List<Map<String, Object>> result = new ArrayList<>();
            for (Map.Entry<String, Double> entry : deptEmissions.entrySet()) {
                result.add(Map.of("name", entry.getKey(), "emissions", entry.getValue()));
            }
            
            // Sort by emissions descending
            result.sort((a, b) -> Double.compare((Double) b.get("emissions"), (Double) a.get("emissions")));
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
