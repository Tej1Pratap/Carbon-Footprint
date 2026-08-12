package com.carbon.backend.controller;

import com.carbon.backend.model.*;
import com.carbon.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/corporate/csr")
public class CorporateCSRController {

    @Autowired private CSRProjectRepository projectRepo;
    @Autowired private CSRParticipationRepository participationRepo;
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
    
    private Organization getMyOrg(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        OrganizationMember member = memberRepo.findByUserIdAndActiveTrue(user.getId())
            .orElseThrow(() -> new RuntimeException("Organization not found"));
        return member.getOrganization();
    }

    // --- PROJECTS (Admin) ---

    @GetMapping("/projects")
    public ResponseEntity<?> getProjects(Authentication auth) {
        try {
            Organization org = getMyOrg(auth);
            List<CSRProject> projects = projectRepo.findByOrganizationId(org.getId());
            
            // Append participant count and hours
            List<Map<String, Object>> result = new ArrayList<>();
            for (CSRProject p : projects) {
                List<CSRParticipation> parts = participationRepo.findByProjectId(p.getId());
                int totalHours = parts.stream().mapToInt(CSRParticipation::getHoursLogged).sum();
                result.add(Map.of(
                    "project", p,
                    "participantsCount", parts.size(),
                    "totalHours", totalHours
                ));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/projects")
    public ResponseEntity<?> createProject(@RequestBody CSRProject data, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            data.setOrganization(org);
            if (data.getStatus() == null) data.setStatus("UPCOMING");
            return ResponseEntity.ok(projectRepo.save(data));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PutMapping("/projects/{id}")
    public ResponseEntity<?> updateProject(@PathVariable Long id, @RequestBody CSRProject updateData, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            CSRProject project = projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
            if (!project.getOrganization().getId().equals(org.getId())) {
                throw new RuntimeException("Access denied");
            }
            
            if (updateData.getName() != null) project.setName(updateData.getName());
            if (updateData.getCategory() != null) project.setCategory(updateData.getCategory());
            if (updateData.getDescription() != null) project.setDescription(updateData.getDescription());
            if (updateData.getProjectDate() != null) project.setProjectDate(updateData.getProjectDate());
            if (updateData.getBudget() != null) project.setBudget(updateData.getBudget());
            if (updateData.getBeneficiariesCount() != null) project.setBeneficiariesCount(updateData.getBeneficiariesCount());
            if (updateData.getStatus() != null) project.setStatus(updateData.getStatus());
            
            return ResponseEntity.ok(projectRepo.save(project));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            CSRProject project = projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
            if (!project.getOrganization().getId().equals(org.getId())) {
                throw new RuntimeException("Access denied");
            }
            
            // Delete participations first
            List<CSRParticipation> parts = participationRepo.findByProjectId(id);
            participationRepo.deleteAll(parts);
            
            projectRepo.delete(project);
            return ResponseEntity.ok(Map.of("message", "Project deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // --- PARTICIPATION (Employees) ---
    
    @GetMapping("/my-participations")
    public ResponseEntity<?> getMyParticipations(Authentication auth) {
        try {
            User user = userRepo.findByEmail(auth.getName()).orElseThrow();
            List<CSRParticipation> parts = participationRepo.findByUserId(user.getId());
            return ResponseEntity.ok(parts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/projects/{id}/join")
    public ResponseEntity<?> joinProject(@PathVariable Long id, Authentication auth) {
        try {
            User user = userRepo.findByEmail(auth.getName()).orElseThrow();
            OrganizationMember member = memberRepo.findByUserIdAndActiveTrue(user.getId())
                .orElseThrow(() -> new RuntimeException("Not part of an organization"));
                
            CSRProject project = projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
            if (!project.getOrganization().getId().equals(member.getOrganization().getId())) {
                throw new RuntimeException("Cannot join project from another organization");
            }
            
            Optional<CSRParticipation> existing = participationRepo.findByUserIdAndProjectId(user.getId(), id);
            if (existing.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Already joined this project"));
            }
            
            CSRParticipation part = new CSRParticipation();
            part.setUser(user);
            part.setProject(project);
            part.setHoursLogged(0);
            
            return ResponseEntity.ok(participationRepo.save(part));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/projects/{id}/log-hours")
    public ResponseEntity<?> logHours(@PathVariable Long id, @RequestBody Map<String, Integer> payload, Authentication auth) {
        try {
            User user = userRepo.findByEmail(auth.getName()).orElseThrow();
            CSRParticipation part = participationRepo.findByUserIdAndProjectId(user.getId(), id)
                .orElseThrow(() -> new RuntimeException("You have not joined this project"));
                
            Integer hours = payload.get("hours");
            if (hours == null || hours < 0) throw new RuntimeException("Invalid hours");
            
            part.setHoursLogged(part.getHoursLogged() + hours);
            return ResponseEntity.ok(participationRepo.save(part));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
