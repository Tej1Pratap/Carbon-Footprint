package com.carbon.backend.repository;

import com.carbon.backend.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByUserIdOrderByCreatedAtDesc(Long userId);
    SupportTicket findByTicketId(String ticketId);
    
    @org.springframework.data.jpa.repository.Query("SELECT t FROM SupportTicket t, OrganizationMember m WHERE t.userId = m.user.id AND m.organization.id = :orgId AND m.active = true ORDER BY t.createdAt DESC")
    List<SupportTicket> findByOrganizationId(@org.springframework.data.repository.query.Param("orgId") Long orgId);
}
