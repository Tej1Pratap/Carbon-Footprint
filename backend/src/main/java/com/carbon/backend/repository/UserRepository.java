package com.carbon.backend.repository;
import com.carbon.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    Boolean existsByEmail(String email);
    Boolean existsByUsername(String username);

    @org.springframework.data.jpa.repository.Query("SELECT u.username, u.id, COALESCE(SUM(a.emissionsKgCo2), 0.0) FROM User u LEFT JOIN ActivityLog a ON u.id = a.user.id GROUP BY u.id, u.username ORDER BY COALESCE(SUM(a.emissionsKgCo2), 0.0) ASC")
    java.util.List<Object[]> getLeaderboardPreview(org.springframework.data.domain.Pageable pageable);
}
