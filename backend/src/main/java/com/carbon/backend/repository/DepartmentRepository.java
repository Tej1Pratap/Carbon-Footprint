package com.carbon.backend.repository;

import com.carbon.backend.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByOrganizationIdAndActiveTrue(Long organizationId);
    boolean existsByNameAndOrganizationIdAndActiveTrue(String name, Long organizationId);
}
