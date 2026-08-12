package com.carbon.backend.repository;
import com.carbon.backend.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByUserId(Long userId);
    
    @org.springframework.data.jpa.repository.Query("SELECT b FROM Badge b JOIN OrganizationMember m ON b.user.id = m.user.id WHERE m.organization.id = :orgId AND m.active = true")
    List<Badge> findByOrganizationId(@org.springframework.data.repository.query.Param("orgId") Long orgId);
}
