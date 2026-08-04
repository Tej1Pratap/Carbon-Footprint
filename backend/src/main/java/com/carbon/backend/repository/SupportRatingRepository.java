package com.carbon.backend.repository;

import com.carbon.backend.model.SupportRating;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportRatingRepository extends JpaRepository<SupportRating, Long> {
    SupportRating findByTicketId(String ticketId);
}
