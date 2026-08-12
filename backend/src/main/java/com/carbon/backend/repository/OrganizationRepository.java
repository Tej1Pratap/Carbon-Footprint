package com.carbon.backend.repository;

import com.carbon.backend.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByName(String name);
    boolean existsByName(String name);
}
