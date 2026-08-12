package com.carbon.backend.repository;
import com.carbon.backend.model.OrganizationGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrganizationGoalRepository extends JpaRepository<OrganizationGoal, Long> {
    List<OrganizationGoal> findByOrganizationId(Long organizationId);
}
