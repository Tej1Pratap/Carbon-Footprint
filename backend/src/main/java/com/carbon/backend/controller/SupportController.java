package com.carbon.backend.controller;

import com.carbon.backend.dto.SupportDTOs.*;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.UserRepository;
import com.carbon.backend.service.SupportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/support")
public class SupportController {

    @Autowired private SupportService supportService;
    @Autowired private UserRepository userRepository;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/faqs")
    public ResponseEntity<?> getFaqs() {
        return ResponseEntity.ok(supportService.getAllFAQs());
    }

    @PostMapping("/tickets")
    public ResponseEntity<?> createTicket(@RequestBody SupportTicketRequest req) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(supportService.createTicket(user.getId(), req));
    }

    @GetMapping("/tickets")
    public ResponseEntity<?> getTickets() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(supportService.getUserTickets(user.getId()));
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<?> getTicketDetail(@PathVariable String id) {
        User user = getAuthenticatedUser();
        boolean isAdmin = "ADMIN".equals(user.getRole());
        return ResponseEntity.ok(supportService.getTicketDetail(user.getId(), id, isAdmin));
    }

    @PostMapping("/tickets/{id}/reply")
    public ResponseEntity<?> replyToTicket(@PathVariable String id, @RequestBody SupportReplyRequest req) {
        User user = getAuthenticatedUser();
        boolean isAdmin = "ADMIN".equals(user.getRole());
        supportService.replyToTicket(user.getId(), id, req, isAdmin);
        return ResponseEntity.ok("Reply added successfully");
    }

    @PatchMapping("/tickets/{id}/status")
    public ResponseEntity<?> updateTicketStatus(@PathVariable String id, @RequestBody java.util.Map<String, String> body) {
        User user = getAuthenticatedUser();
        // Allow user to reopen, close, or resolve ticket, or admin to change status
        String newStatus = body.get("status");
        if ("ADMIN".equals(user.getRole()) || "OPEN".equals(newStatus) || "CLOSED".equals(newStatus) || "RESOLVED".equals(newStatus)) {
            supportService.updateTicketStatus(id, newStatus);
            return ResponseEntity.ok("Status updated");
        }
        return ResponseEntity.status(403).body("Unauthorized");
    }

    @PatchMapping("/tickets/{id}/assign")
    public ResponseEntity<?> assignTicket(@PathVariable String id, @RequestBody java.util.Map<String, Long> body) {
        if (!"ADMIN".equals(getAuthenticatedUser().getRole())) return ResponseEntity.status(403).build();
        supportService.assignTicket(id, body.get("adminId"));
        return ResponseEntity.ok("Assigned successfully");
    }

    @PostMapping("/tickets/{id}/rating")
    public ResponseEntity<?> rateTicket(@PathVariable String id, @RequestBody SupportRatingRequest req) {
        supportService.addRating(id, req);
        return ResponseEntity.ok("Rated successfully");
    }

    // --- ADMIN SPECIFIC ---

    @GetMapping("/admin/dashboard")
    public ResponseEntity<?> getAdminDashboard() {
        if (!"ADMIN".equals(getAuthenticatedUser().getRole())) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(supportService.getAdminDashboard());
    }

    @GetMapping("/admin/tickets")
    public ResponseEntity<?> getAllTicketsAdmin() {
        if (!"ADMIN".equals(getAuthenticatedUser().getRole())) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(supportService.getAllTicketsAdmin());
    }

    @PostMapping("/faqs")
    public ResponseEntity<?> createFAQ(@RequestBody com.carbon.backend.model.SupportFAQ faq) {
        if (!"ADMIN".equals(getAuthenticatedUser().getRole())) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(supportService.createFAQ(faq));
    }

    @PutMapping("/faqs/{id}")
    public ResponseEntity<?> updateFAQ(@PathVariable Long id, @RequestBody com.carbon.backend.model.SupportFAQ faq) {
        if (!"ADMIN".equals(getAuthenticatedUser().getRole())) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(supportService.updateFAQ(id, faq));
    }

    @DeleteMapping("/faqs/{id}")
    public ResponseEntity<?> deleteFAQ(@PathVariable Long id) {
        if (!"ADMIN".equals(getAuthenticatedUser().getRole())) return ResponseEntity.status(403).build();
        supportService.deleteFAQ(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status")
    public ResponseEntity<?> getSystemStatus() {
        return ResponseEntity.ok(supportService.getSystemStatus());
    }
}
