package com.carbon.backend.repository;
import com.carbon.backend.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserId(Long userId);
    
    @Transactional
    void deleteByUserId(Long userId);
}
