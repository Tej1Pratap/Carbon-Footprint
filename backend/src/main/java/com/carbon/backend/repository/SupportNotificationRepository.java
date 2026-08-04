package com.carbon.backend.repository;

import com.carbon.backend.model.SupportNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SupportNotificationRepository extends JpaRepository<SupportNotification, Long> {
    List<SupportNotification> findByUserIdOrderByCreatedAtDesc(Long userId);
}
