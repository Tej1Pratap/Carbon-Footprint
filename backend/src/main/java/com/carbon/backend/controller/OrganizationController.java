package com.carbon.backend.controller;

import com.carbon.backend.model.Organization;
import com.carbon.backend.model.OrganizationMember;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.OrganizationMemberRepository;
import com.carbon.backend.repository.OrganizationRepository;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/corporate/organization")
public class OrganizationController {

    @Autowired private OrganizationRepository orgRepo;
    @Autowired private OrganizationMemberRepository memberRepo;
    @Autowired private UserRepository userRepo;

    @PostMapping("/onboard")
    public ResponseEntity<?> onboardOrganization(@RequestBody Organization org, Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        
        if (orgRepo.existsByName(org.getName())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Organization name already exists."));
        }
        
        // Check if user already belongs to an active org
        Optional<OrganizationMember> existingMember = memberRepo.findByUserIdAndActiveTrue(user.getId());
        if (existingMember.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "You already belong to an organization."));
        }

        // Save Organization
        Organization savedOrg = orgRepo.save(org);
        
        // Add User as ORG_ADMIN
        OrganizationMember member = new OrganizationMember();
        member.setUser(user);
        member.setOrganization(savedOrg);
        member.setRole("ORG_ADMIN");
        memberRepo.save(member);
        
        return ResponseEntity.ok(Map.of(
            "message", "Organization created successfully",
            "organization", savedOrg,
            "role", "ORG_ADMIN"
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyOrganization(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        Optional<OrganizationMember> memberOpt = memberRepo.findByUserIdAndActiveTrue(user.getId());
        
        if (memberOpt.isPresent()) {
            OrganizationMember member = memberOpt.get();
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("organization", member.getOrganization());
            response.put("role", member.getRole());
            response.put("department", member.getDepartment() != null ? member.getDepartment().getName() : null);
            response.put("team", member.getTeam() != null ? member.getTeam().getName() : null);
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.ok(Map.of("organization", null));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyOrganization(@RequestBody Organization orgUpdate, Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        OrganizationMember member = memberRepo.findByUserIdAndActiveTrue(user.getId())
            .orElseThrow(() -> new RuntimeException("Organization not found"));
            
        if (!"ORG_ADMIN".equals(member.getRole())) {
            return ResponseEntity.status(403).body(Map.of("message", "Only ORG_ADMIN can update organization settings"));
        }
        
        Organization org = member.getOrganization();
        
        // Update allowed fields
        if (orgUpdate.getIndustry() != null) org.setIndustry(orgUpdate.getIndustry());
        if (orgUpdate.getCompanySize() != null) org.setCompanySize(orgUpdate.getCompanySize());
        if (orgUpdate.getCountry() != null) org.setCountry(orgUpdate.getCountry());
        if (orgUpdate.getStateRegion() != null) org.setStateRegion(orgUpdate.getStateRegion());
        if (orgUpdate.getWebsite() != null) org.setWebsite(orgUpdate.getWebsite());
        if (orgUpdate.getContactEmail() != null) org.setContactEmail(orgUpdate.getContactEmail());
        if (orgUpdate.getDescription() != null) org.setDescription(orgUpdate.getDescription());
        if (orgUpdate.getSustainabilityTarget() != null) org.setSustainabilityTarget(orgUpdate.getSustainabilityTarget());
        if (orgUpdate.getCsrBudget() != null) org.setCsrBudget(orgUpdate.getCsrBudget());
        if (orgUpdate.getLogo() != null) org.setLogo(orgUpdate.getLogo());
        
        orgRepo.save(org);
        
        return ResponseEntity.ok(Map.of(
            "message", "Organization updated successfully",
            "organization", org
        ));
    }
}
