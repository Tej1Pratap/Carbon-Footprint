package com.carbon.backend.repository;
import com.carbon.backend.model.Badge;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByUserId(Long userId);
}
