package com.carbon.backend.repository;

import com.carbon.backend.model.SupportReply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportReplyRepository extends JpaRepository<SupportReply, Long> {
    List<SupportReply> findByTicketIdOrderByCreatedAtAsc(String ticketId);
}
