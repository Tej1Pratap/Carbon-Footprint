package com.carbon.backend.service;

import com.carbon.backend.dto.SupportDTOs.*;
import com.carbon.backend.model.*;
import com.carbon.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SupportService {

    @Autowired private SupportTicketRepository ticketRepo;
    @Autowired private SupportReplyRepository replyRepo;
    @Autowired private SupportFAQRepository faqRepo;
    @Autowired private SupportRatingRepository ratingRepo;
    @Autowired private SupportNotificationRepository notifRepo;
    @Autowired private EmailService emailService;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationRepository globalNotifRepo;

    public List<SupportFAQ> getAllFAQs() {
        return faqRepo.findAllByOrderByDisplayOrderAsc();
    }

    public SupportFAQ createFAQ(SupportFAQ faq) {
        return faqRepo.save(faq);
    }

    public SupportFAQ updateFAQ(Long id, SupportFAQ faqDetails) {
        SupportFAQ faq = faqRepo.findById(id).orElseThrow();
        faq.setQuestion(faqDetails.getQuestion());
        faq.setAnswer(faqDetails.getAnswer());
        faq.setCategory(faqDetails.getCategory());
        faq.setDisplayOrder(faqDetails.getDisplayOrder());
        faq.setIsPinned(faqDetails.getIsPinned() != null ? faqDetails.getIsPinned() : faq.getIsPinned());
        faq.setStatus(faqDetails.getStatus() != null ? faqDetails.getStatus() : faq.getStatus());
        return faqRepo.save(faq);
    }

    public void deleteFAQ(Long id) {
        faqRepo.deleteById(id);
    }

    public SupportTicketResponse createTicket(Long userId, SupportTicketRequest req) {
        SupportTicket ticket = new SupportTicket();
        ticket.setTicketId("TCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        ticket.setUserId(userId);
        ticket.setCategory(req.getCategory());
        ticket.setPriority(req.getPriority());
        ticket.setTitle(req.getTitle());
        ticket.setDescription(req.getDescription());
        ticket.setStatus("OPEN");
        ticket.setBrowser(req.getBrowser());
        ticket.setDevice(req.getDevice());
        ticket.setOs(req.getOs());

        ticket = ticketRepo.save(ticket);
        
        // Notify Admins
        try {
            User creator = userRepository.findById(userId).orElse(null);
            List<User> admins = userRepository.findAll().stream().filter(u -> "ADMIN".equals(u.getRole())).collect(Collectors.toList());
            for (User admin : admins) {
                Notification adminNotif = new Notification();
                adminNotif.setUser(admin);
                adminNotif.setType("SUPPORT_TICKET");
                adminNotif.setMessage("New Support Ticket: " + ticket.getTicketId() + " - " + ticket.getTitle());
                globalNotifRepo.save(adminNotif);
                
                emailService.sendAdminNewTicketEmail(admin.getEmail(), ticket.getTicketId(), req.getCategory());
            }
            if (creator != null) {
                emailService.sendSupportTicketEmail(creator.getEmail(), creator.getUsername(), ticket.getTicketId(), req.getTitle(), ticket.getDescription(), null, false);
            }
        } catch(Exception e) {}

        return mapToResponse(ticket);
    }

    public List<SupportTicketResponse> getUserTickets(Long userId) {
        return ticketRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public SupportTicketDetailResponse getTicketDetail(Long userId, String ticketId, boolean isAdmin) {
        SupportTicket ticket = ticketRepo.findByTicketId(ticketId);
        if (ticket == null || (!isAdmin && !ticket.getUserId().equals(userId))) {
            throw new RuntimeException("Ticket not found or unauthorized");
        }

        List<SupportReply> replies = replyRepo.findByTicketIdOrderByCreatedAtAsc(ticketId);

        SupportTicketDetailResponse res = new SupportTicketDetailResponse();
        res.setTicketId(ticket.getTicketId());
        res.setCategory(ticket.getCategory());
        res.setPriority(ticket.getPriority());
        res.setTitle(ticket.getTitle());
        res.setDescription(ticket.getDescription());
        res.setStatus(ticket.getStatus());
        res.setBrowser(ticket.getBrowser());
        res.setDevice(ticket.getDevice());
        res.setOs(ticket.getOs());
        res.setCreatedAt(ticket.getCreatedAt());
        res.setUpdatedAt(ticket.getUpdatedAt());
        
        res.setReplies(replies.stream().map(r -> {
            SupportReplyResponse rep = new SupportReplyResponse();
            rep.setSender(r.getSender());
            rep.setMessage(r.getMessage());
            rep.setCreatedAt(r.getCreatedAt());
            return rep;
        }).collect(Collectors.toList()));

        return res;
    }

    public void replyToTicket(Long userId, String ticketId, SupportReplyRequest req, boolean isAdmin) {
        SupportTicket ticket = ticketRepo.findByTicketId(ticketId);
        if (ticket == null || (!isAdmin && !ticket.getUserId().equals(userId))) {
            throw new RuntimeException("Ticket not found or unauthorized");
        }

        SupportReply reply = new SupportReply();
        reply.setTicketId(ticketId);
        reply.setSender(isAdmin ? "ADMIN" : "USER");
        reply.setMessage(req.getMessage());
        reply.setIsInternalNote(req.getIsInternalNote() != null ? req.getIsInternalNote() : false);
        replyRepo.save(reply);
        
        if (!reply.getIsInternalNote()) {
            if (isAdmin) {
                ticket.setStatus("WAITING_FOR_USER");
                // Notify User
                try {
                    User u = userRepository.findById(ticket.getUserId()).orElse(null);
                    if (u != null) {
                        Notification n = new Notification();
                        n.setUser(u);
                        n.setType("SUPPORT_REPLY");
                        n.setMessage("An admin replied to your ticket " + ticketId);
                        globalNotifRepo.save(n);
                        emailService.sendSupportReplyEmail(u.getEmail(), u.getUsername(), ticketId);
                    }
                } catch (Exception e) {}
            } else {
                ticket.setStatus("IN_PROGRESS");
            }
            ticketRepo.save(ticket);
        }
    }

    public void updateTicketStatus(String ticketId, String status) {
        SupportTicket ticket = ticketRepo.findByTicketId(ticketId);
        if (ticket != null) {
            ticket.setStatus(status);
            ticketRepo.save(ticket);
            
            if ("RESOLVED".equals(status)) {
                try {
                    User u = userRepository.findById(ticket.getUserId()).orElse(null);
                    if (u != null) {
                        Notification n = new Notification();
                        n.setUser(u);
                        n.setType("SUPPORT_RESOLVED");
                        n.setMessage("Your support ticket " + ticketId + " has been resolved!");
                        globalNotifRepo.save(n);
                        
                        List<SupportReply> replies = replyRepo.findByTicketIdOrderByCreatedAtAsc(ticketId);
                        String resolution = "Resolved by Admin.";
                        for (int i = replies.size() - 1; i >= 0; i--) {
                            if ("ADMIN".equals(replies.get(i).getSender()) && !replies.get(i).getIsInternalNote()) {
                                resolution = replies.get(i).getMessage();
                                break;
                            }
                        }
                        
                        emailService.sendSupportTicketEmail(u.getEmail(), u.getUsername(), ticketId, ticket.getTitle(), ticket.getDescription(), resolution, true);
                    }
                } catch (Exception e) {}
            }
        }
    }

    public void assignTicket(String ticketId, Long adminId) {
        SupportTicket ticket = ticketRepo.findByTicketId(ticketId);
        if (ticket != null) {
            ticket.setAssignedAdminId(adminId);
            ticketRepo.save(ticket);
        }
    }

    public void addRating(String ticketId, SupportRatingRequest req) {
        SupportRating rating = new SupportRating();
        rating.setTicketId(ticketId);
        rating.setStars(req.getStars());
        rating.setComment(req.getComment());
        ratingRepo.save(rating);
    }

    public List<SupportTicketResponse> getAllTicketsAdmin() {
        return ticketRepo.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public AdminSupportDashboardResponse getAdminDashboard() {
        List<SupportTicket> all = ticketRepo.findAll();
        AdminSupportDashboardResponse res = new AdminSupportDashboardResponse();
        res.setTotalTickets(all.size());
        res.setOpenTickets(all.stream().filter(t -> "OPEN".equals(t.getStatus())).count());
        res.setInProgressTickets(all.stream().filter(t -> "IN_PROGRESS".equals(t.getStatus())).count());
        res.setResolvedTickets(all.stream().filter(t -> "RESOLVED".equals(t.getStatus())).count());
        res.setClosedTickets(all.stream().filter(t -> "CLOSED".equals(t.getStatus())).count());
        res.setCriticalIssues(all.stream().filter(t -> "Critical".equals(t.getPriority())).count());
        return res;
    }

    public SystemStatusResponse getSystemStatus() {
        return new SystemStatusResponse();
    }

    private SupportTicketResponse mapToResponse(SupportTicket ticket) {
        SupportTicketResponse res = new SupportTicketResponse();
        res.setTicketId(ticket.getTicketId());
        res.setCategory(ticket.getCategory());
        res.setPriority(ticket.getPriority());
        res.setTitle(ticket.getTitle());
        res.setDescription(ticket.getDescription());
        res.setStatus(ticket.getStatus());
        res.setAssignedAdminId(ticket.getAssignedAdminId());
        res.setFeatureStatus(ticket.getFeatureStatus());
        res.setVotes(ticket.getVotes());
        res.setCreatedAt(ticket.getCreatedAt());
        res.setUpdatedAt(ticket.getUpdatedAt());
        return res;
    }
}
