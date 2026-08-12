package com.carbon.backend.controller;

import com.carbon.backend.model.Organization;
import com.carbon.backend.model.OrganizationGoal;
import com.carbon.backend.model.OrganizationMember;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.OrganizationGoalRepository;
import com.carbon.backend.repository.OrganizationMemberRepository;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/corporate/goals")
public class CorporateGoalController {

    @Autowired private OrganizationGoalRepository goalRepo;
    @Autowired private OrganizationMemberRepository memberRepo;
    @Autowired private UserRepository userRepo;

    private Organization getMyOrgAsAdmin(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        OrganizationMember member = memberRepo.findByUserIdAndActiveTrue(user.getId())
            .orElseThrow(() -> new RuntimeException("Organization not found"));
            
        if (!"ORG_ADMIN".equals(member.getRole()) && !"CSR_MANAGER".equals(member.getRole())) {
            throw new RuntimeException("Access denied");
        }
        return member.getOrganization();
    }

    @GetMapping
    public ResponseEntity<?> getGoals(Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            List<OrganizationGoal> goals = goalRepo.findByOrganizationId(org.getId());
            return ResponseEntity.ok(goals);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createGoal(@RequestBody OrganizationGoal goalData, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            
            OrganizationGoal goal = new OrganizationGoal();
            goal.setOrganization(org);
            goal.setDescription(goalData.getDescription());
            goal.setTargetReductionPercentage(goalData.getTargetReductionPercentage());
            goal.setBaselineEmissions(goalData.getBaselineEmissions());
            goal.setDeadline(goalData.getDeadline());
            goal.setStatus("ON_TRACK");
            
            return ResponseEntity.ok(goalRepo.save(goal));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGoal(@PathVariable Long id, @RequestBody OrganizationGoal updateData, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            OrganizationGoal goal = goalRepo.findById(id).orElseThrow(() -> new RuntimeException("Goal not found"));
            if (!goal.getOrganization().getId().equals(org.getId())) {
                throw new RuntimeException("Access denied");
            }
            if (updateData.getStatus() != null) {
                goal.setStatus(updateData.getStatus());
            }
            return ResponseEntity.ok(goalRepo.save(goal));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long id, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            OrganizationGoal goal = goalRepo.findById(id).orElseThrow(() -> new RuntimeException("Goal not found"));
            if (!goal.getOrganization().getId().equals(org.getId())) {
                throw new RuntimeException("Access denied");
            }
            goalRepo.delete(goal);
            return ResponseEntity.ok(Map.of("message", "Goal deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
