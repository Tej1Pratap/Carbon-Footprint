package com.carbon.backend.repository;

import com.carbon.backend.model.EmailVerificationToken;
import com.carbon.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    Optional<EmailVerificationToken> findByVerificationCode(String verificationCode);
    Optional<EmailVerificationToken> findByUser(User user);
    void deleteByUser(User user);
}
