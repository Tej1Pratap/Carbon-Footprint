package com.carbon.backend.controller;

import com.carbon.backend.model.*;
import com.carbon.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/corporate/reports")
public class CorporateReportController {

    @Autowired private ActivityLogRepository activityLogRepo;
    @Autowired private OrganizationMemberRepository memberRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private OrganizationGoalRepository goalRepo;
    @Autowired private CSRProjectRepository projectRepo;

    private Organization getMyOrgAsAdmin(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        OrganizationMember member = memberRepo.findByUserIdAndActiveTrue(user.getId())
            .orElseThrow(() -> new RuntimeException("Organization not found"));
            
        if (!"ORG_ADMIN".equals(member.getRole()) && !"CSR_MANAGER".equals(member.getRole())) {
            throw new RuntimeException("Access denied");
        }
        return member.getOrganization();
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getReportSummary(@RequestParam(required = false) Long departmentId, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            
            List<ActivityLog> allLogs = activityLogRepo.findByOrganizationId(org.getId());
            String departmentName = null;
            
            if (departmentId != null) {
                List<OrganizationMember> orgMembers = memberRepo.findByOrganizationIdAndActiveTrue(org.getId());
                Set<Long> deptUserIds = orgMembers.stream()
                    .filter(m -> m.getDepartment() != null && m.getDepartment().getId().equals(departmentId))
                    .map(m -> m.getUser().getId())
                    .collect(java.util.stream.Collectors.toSet());
                
                allLogs = allLogs.stream()
                    .filter(log -> deptUserIds.contains(log.getUser().getId()))
                    .collect(java.util.stream.Collectors.toList());
                
                Optional<OrganizationMember> deptSample = orgMembers.stream()
                    .filter(m -> m.getDepartment() != null && m.getDepartment().getId().equals(departmentId))
                    .findFirst();
                if (deptSample.isPresent()) {
                    departmentName = deptSample.get().getDepartment().getName();
                }
            }
            
            double totalEmissions = allLogs.stream().mapToDouble(ActivityLog::getEmissionsKgCo2).sum();
            
            List<OrganizationGoal> goals = goalRepo.findByOrganizationId(org.getId());
            long achievedGoals = goals.stream().filter(g -> "ACHIEVED".equals(g.getStatus())).count();
            
            List<CSRProject> projects = projectRepo.findByOrganizationId(org.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("organization", org.getName());
            response.put("industry", org.getIndustry());
            response.put("department", departmentName);
            response.put("totalEmissionsKg", totalEmissions);
            response.put("totalGoals", goals.size());
            response.put("achievedGoals", achievedGoals);
            response.put("totalCsrProjects", projects.size());
            response.put("generatedAt", new Date());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
