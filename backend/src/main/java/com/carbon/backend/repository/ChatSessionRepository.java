package com.carbon.backend.repository;

import com.carbon.backend.model.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {
    Optional<ChatSession> findFirstByUserIdOrderByUpdatedAtDesc(Long userId);
    void deleteByUserId(Long userId);
}
