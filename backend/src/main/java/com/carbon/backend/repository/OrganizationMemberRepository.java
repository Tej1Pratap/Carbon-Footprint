package com.carbon.backend.repository;

import com.carbon.backend.model.OrganizationMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {
    Optional<OrganizationMember> findByUserIdAndOrganizationId(Long userId, Long orgId);
    Optional<OrganizationMember> findByUserIdAndActiveTrue(Long userId);
    List<OrganizationMember> findByOrganizationId(Long orgId);
    List<OrganizationMember> findByOrganizationIdAndActiveTrue(Long orgId);
    List<OrganizationMember> findByOrganizationIdAndRole(Long orgId, String role);
}
