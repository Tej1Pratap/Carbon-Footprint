package com.carbon.backend.repository;
import com.carbon.backend.model.CSRParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CSRParticipationRepository extends JpaRepository<CSRParticipation, Long> {
    List<CSRParticipation> findByProjectId(Long projectId);
    List<CSRParticipation> findByUserId(Long userId);
    Optional<CSRParticipation> findByUserIdAndProjectId(Long userId, Long projectId);
}
