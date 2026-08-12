package com.carbon.backend.repository;
import com.carbon.backend.model.CSRProject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CSRProjectRepository extends JpaRepository<CSRProject, Long> {
    List<CSRProject> findByOrganizationId(Long organizationId);
}
