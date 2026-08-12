package com.carbon.backend.repository;
import com.carbon.backend.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserId(Long userId);
    
    @Transactional
    void deleteByUserId(Long userId);

    long countByLogDateAfter(java.time.LocalDateTime date);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM ActivityLog a, OrganizationMember m WHERE a.user.id = m.user.id AND m.organization.id = :orgId AND m.active = true")
    List<ActivityLog> findByOrganizationId(@org.springframework.data.repository.query.Param("orgId") Long orgId);
}
