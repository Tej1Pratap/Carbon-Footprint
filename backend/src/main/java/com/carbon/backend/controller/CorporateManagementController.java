package com.carbon.backend.controller;

import com.carbon.backend.model.Department;
import com.carbon.backend.model.Organization;
import com.carbon.backend.model.OrganizationMember;
import com.carbon.backend.model.User;
import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.Badge;
import com.carbon.backend.model.SupportTicket;
import com.carbon.backend.model.SupportReply;
import com.carbon.backend.model.SupportFAQ;
import com.carbon.backend.model.EmissionFactor;
import com.carbon.backend.repository.DepartmentRepository;
import com.carbon.backend.repository.OrganizationMemberRepository;
import com.carbon.backend.repository.UserRepository;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.repository.BadgeRepository;
import com.carbon.backend.repository.SupportTicketRepository;
import com.carbon.backend.repository.SupportReplyRepository;
import com.carbon.backend.repository.SupportFAQRepository;
import com.carbon.backend.repository.EmissionFactorRepository;
import com.carbon.backend.dto.SupportDTOs.SupportReplyRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/corporate/management")
public class CorporateManagementController {

    @Autowired private DepartmentRepository departmentRepo;
    @Autowired private OrganizationMemberRepository memberRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private ActivityLogRepository activityLogRepo;
    @Autowired private BadgeRepository badgeRepo;
    @Autowired private SupportTicketRepository ticketRepo;
    @Autowired private SupportReplyRepository replyRepo;
    @Autowired private SupportFAQRepository faqRepo;
    @Autowired private EmissionFactorRepository emissionFactorRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    private Organization getMyOrgAsAdmin(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        OrganizationMember member = memberRepo.findByUserIdAndActiveTrue(user.getId())
            .orElseThrow(() -> new RuntimeException("Organization not found"));
            
        if (!"ORG_ADMIN".equals(member.getRole())) {
            throw new RuntimeException("Access denied: Only ORG_ADMIN can perform this action");
        }
        return member.getOrganization();
    }

    // --- DEPARTMENTS ---

    @GetMapping("/departments")
    public ResponseEntity<?> getDepartments(Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            List<Department> depts = departmentRepo.findByOrganizationIdAndActiveTrue(org.getId());
            return ResponseEntity.ok(depts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/departments")
    public ResponseEntity<?> addDepartment(@RequestBody Department deptData, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            if (departmentRepo.existsByNameAndOrganizationIdAndActiveTrue(deptData.getName(), org.getId())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Department name already exists"));
            }
            
            Department dept = new Department();
            dept.setOrganization(org);
            dept.setName(deptData.getName());
            dept.setDescription(deptData.getDescription());
            dept.setActive(true);
            
            return ResponseEntity.ok(departmentRepo.save(dept));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<?> updateDepartment(@PathVariable Long id, @RequestBody Department deptData, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            Department dept = departmentRepo.findById(id).orElseThrow(() -> new RuntimeException("Department not found"));
            
            if (!dept.getOrganization().getId().equals(org.getId())) {
                throw new RuntimeException("Access denied");
            }
            
            dept.setName(deptData.getName());
            dept.setDescription(deptData.getDescription());
            return ResponseEntity.ok(departmentRepo.save(dept));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            Department dept = departmentRepo.findById(id).orElseThrow(() -> new RuntimeException("Department not found"));
            
            if (!dept.getOrganization().getId().equals(org.getId())) {
                throw new RuntimeException("Access denied");
            }
            
            dept.setActive(false);
            departmentRepo.save(dept);
            
            // Remove department from active employees
            List<OrganizationMember> members = memberRepo.findByOrganizationIdAndActiveTrue(org.getId());
            for (OrganizationMember member : members) {
                if (member.getDepartment() != null && member.getDepartment().getId().equals(id)) {
                    member.setDepartment(null);
                    memberRepo.save(member);
                }
            }
            
            return ResponseEntity.ok(Map.of("message", "Department deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // --- EMPLOYEES ---

    @GetMapping("/employees")
    public ResponseEntity<?> getEmployees(Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            List<OrganizationMember> members = memberRepo.findByOrganizationIdAndActiveTrue(org.getId());
            
            List<Map<String, Object>> employeeDTOs = members.stream().map(m -> {
                Map<String, Object> map = new java.util.HashMap<>();
                map.put("memberId", m.getId());
                map.put("userId", m.getUser().getId());
                map.put("username", m.getUser().getUsername());
                map.put("email", m.getUser().getEmail());
                map.put("role", m.getRole());
                map.put("department", m.getDepartment() != null ? m.getDepartment() : null);
                map.put("joinedDate", m.getJoinedDate());
                return map;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(employeeDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/employees")
    public ResponseEntity<?> addEmployee(@RequestBody Map<String, String> payload, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            String email = payload.get("email");
            
            User userToAdd = userRepo.findByEmail(email).orElse(null);
            if (userToAdd == null) {
                // Admin is creating the ID
                userToAdd = new User();
                userToAdd.setEmail(email);
                userToAdd.setUsername(email.split("@")[0]);
                userToAdd.setPassword(passwordEncoder.encode("Welcome@123")); // Default password
                userToAdd.setRole("USER"); // Base role
                userToAdd.setEmailVerified(true);
                userToAdd.setEnabled(true);
                userToAdd = userRepo.save(userToAdd);
            }
            if (memberRepo.findByUserIdAndActiveTrue(userToAdd.getId()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "User is already part of an organization."));
            }
            
            OrganizationMember newMember = new OrganizationMember();
            newMember.setUser(userToAdd);
            newMember.setOrganization(org);
            newMember.setRole(payload.getOrDefault("role", "EMPLOYEE"));
            
            if (payload.containsKey("departmentId")) {
                Department dept = departmentRepo.findById(Long.parseLong(payload.get("departmentId"))).orElse(null);
                if (dept != null && dept.getOrganization().getId().equals(org.getId())) {
                    newMember.setDepartment(dept);
                }
            }
            
            memberRepo.save(newMember);
            
            return ResponseEntity.ok(Map.of("message", "Employee added successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/employees/{memberId}/department")
    public ResponseEntity<?> assignDepartment(@PathVariable Long memberId, @RequestBody Map<String, Long> payload, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            OrganizationMember member = memberRepo.findById(memberId).orElseThrow(() -> new RuntimeException("Member not found"));
            
            if (!member.getOrganization().getId().equals(org.getId())) {
                throw new RuntimeException("Access denied");
            }
            
            Long deptId = payload.get("departmentId");
            if (deptId == null) {
                member.setDepartment(null); // Remove from department
            } else {
                Department dept = departmentRepo.findById(deptId).orElseThrow(() -> new RuntimeException("Department not found"));
                if (!dept.getOrganization().getId().equals(org.getId())) {
                    throw new RuntimeException("Access denied");
                }
                member.setDepartment(dept);
            }
            
            return ResponseEntity.ok(memberRepo.save(member));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/employees/{memberId}")
    public ResponseEntity<?> removeEmployee(@PathVariable Long memberId, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            OrganizationMember member = memberRepo.findById(memberId).orElseThrow(() -> new RuntimeException("Member not found"));
            
            if (!member.getOrganization().getId().equals(org.getId())) {
                throw new RuntimeException("Access denied");
            }
            
            if ("ORG_ADMIN".equals(member.getRole())) {
                // Check if they are the last admin
                long adminCount = memberRepo.findByOrganizationIdAndRole(org.getId(), "ORG_ADMIN").stream().filter(OrganizationMember::isActive).count();
                if (adminCount <= 1) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Cannot remove the last Organization Admin."));
                }
            }
            
            member.setActive(false);
            memberRepo.save(member);
            return ResponseEntity.ok(Map.of("message", "Employee removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // --- ACTIVITY LOGS ---

    @GetMapping("/activities")
    public ResponseEntity<?> getEmployeeActivities(Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            List<ActivityLog> logs = activityLogRepo.findByOrganizationId(org.getId());
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/activities/bulk-action")
    public ResponseEntity<?> bulkActionActivities(@RequestBody Map<String, Object> payload, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            String action = (String) payload.get("action");
            List<Integer> idList = (List<Integer>) payload.get("ids");
            List<Long> ids = idList.stream().map(Integer::longValue).collect(Collectors.toList());
            
            if ("DELETE".equals(action)) {
                List<ActivityLog> orgLogs = activityLogRepo.findByOrganizationId(org.getId());
                List<Long> orgLogIds = orgLogs.stream().map(ActivityLog::getId).collect(Collectors.toList());
                for (Long id : ids) {
                    if (orgLogIds.contains(id)) {
                        activityLogRepo.deleteById(id);
                    }
                }
            }
            return ResponseEntity.ok(Map.of("message", "Bulk action successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // --- BADGES ---

    @GetMapping("/badges")
    public ResponseEntity<?> getBadges(Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            return ResponseEntity.ok(badgeRepo.findByOrganizationId(org.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/badges/award")
    public ResponseEntity<?> awardBadge(@RequestBody java.util.Map<String, String> payload, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            Long userId = Long.parseLong(payload.get("userId"));
            String name = payload.get("name");
            String icon = payload.get("icon");

            OrganizationMember targetMember = memberRepo.findByUserIdAndActiveTrue(userId).orElseThrow();
            if (!targetMember.getOrganization().getId().equals(org.getId())) throw new RuntimeException("Access Denied");

            Badge badge = new Badge();
            badge.setUser(targetMember.getUser());
            badge.setName(name);
            badge.setIcon(icon);
            badge.setEarnedDate(java.time.LocalDate.now());
            badgeRepo.save(badge);

            return ResponseEntity.ok(Map.of("message", "Badge awarded"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/badges/{id}")
    public ResponseEntity<?> deleteBadge(@PathVariable Long id, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            Badge badge = badgeRepo.findById(id).orElseThrow();
            OrganizationMember member = memberRepo.findByUserIdAndActiveTrue(badge.getUser().getId()).orElseThrow();
            
            if (!member.getOrganization().getId().equals(org.getId())) throw new RuntimeException("Access Denied");
            
            badgeRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Badge revoked"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // --- SUPPORT ---

    @GetMapping("/support/dashboard")
    public ResponseEntity<?> getSupportDashboard(Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            List<SupportTicket> orgTickets = ticketRepo.findByOrganizationId(org.getId());
            
            long total = orgTickets.size();
            long open = orgTickets.stream().filter(t -> "OPEN".equals(t.getStatus())).count();
            long inProgress = orgTickets.stream().filter(t -> "IN_PROGRESS".equals(t.getStatus())).count();
            long critical = orgTickets.stream().filter(t -> "Critical".equals(t.getPriority())).count();
            long resolved = orgTickets.stream().filter(t -> "RESOLVED".equals(t.getStatus())).count();
            
            return ResponseEntity.ok(Map.of(
                "totalTickets", total,
                "openTickets", open,
                "inProgressTickets", inProgress,
                "criticalIssues", critical,
                "resolvedTickets", resolved
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/support/tickets")
    public ResponseEntity<?> getTickets(Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            return ResponseEntity.ok(ticketRepo.findByOrganizationId(org.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/support/tickets/{id}")
    public ResponseEntity<?> getTicketDetail(@PathVariable String id, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            SupportTicket ticket = ticketRepo.findByTicketId(id);
            if (ticket == null) throw new RuntimeException("Ticket not found");
            
            OrganizationMember member = memberRepo.findByUserIdAndActiveTrue(ticket.getUserId()).orElseThrow();
            if (!member.getOrganization().getId().equals(org.getId())) throw new RuntimeException("Access Denied");
            
            return ResponseEntity.ok(ticket);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/support/tickets/{id}/reply")
    public ResponseEntity<?> replyToTicket(@PathVariable String id, @RequestBody SupportReplyRequest req, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            SupportTicket ticket = ticketRepo.findByTicketId(id);
            if (ticket == null) throw new RuntimeException("Ticket not found");
            
            OrganizationMember member = memberRepo.findByUserIdAndActiveTrue(ticket.getUserId()).orElseThrow();
            if (!member.getOrganization().getId().equals(org.getId())) throw new RuntimeException("Access Denied");
            
            SupportReply reply = new SupportReply();
            reply.setTicketId(ticket.getTicketId());
            reply.setSender("ADMIN");
            reply.setMessage(req.getMessage());
            reply.setIsInternalNote(req.getIsInternalNote());
            replyRepo.save(reply);
            
            ticket.setStatus("WAITING_FOR_USER");
            ticketRepo.save(ticket);
            
            return ResponseEntity.ok(Map.of("message", "Reply added"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/support/tickets/{id}/status")
    public ResponseEntity<?> updateTicketStatus(@PathVariable String id, @RequestBody Map<String, String> body, Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            SupportTicket ticket = ticketRepo.findByTicketId(id);
            if (ticket == null) throw new RuntimeException("Ticket not found");
            
            OrganizationMember member = memberRepo.findByUserIdAndActiveTrue(ticket.getUserId()).orElseThrow();
            if (!member.getOrganization().getId().equals(org.getId())) throw new RuntimeException("Access Denied");
            
            ticket.setStatus(body.get("status"));
            ticketRepo.save(ticket);
            return ResponseEntity.ok(Map.of("message", "Status updated"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    // --- EMISSION FACTORS (READ-ONLY) ---

    @GetMapping("/emission-factors")
    public ResponseEntity<?> getEmissionFactors(Authentication auth) {
        try {
            getMyOrgAsAdmin(auth); // verify admin
            return ResponseEntity.ok(emissionFactorRepo.findAll());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- RECOMMENDATIONS (ORG SPECIFIC) ---
    @Autowired
    private com.carbon.backend.service.RecommendationEngine recommendationEngine;

    @GetMapping("/recommendations")
    public ResponseEntity<?> getRecommendations(Authentication auth) {
        try {
            Organization org = getMyOrgAsAdmin(auth);
            List<OrganizationMember> members = memberRepo.findByOrganizationIdAndActiveTrue(org.getId());
            
            List<Map<String, Object>> allRecs = new ArrayList<>();
            for (OrganizationMember member : members) {
                User u = member.getUser();
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
            return ResponseEntity.ok(allRecs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
