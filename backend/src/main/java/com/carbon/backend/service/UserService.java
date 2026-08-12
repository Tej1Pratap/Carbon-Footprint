package com.carbon.backend.service;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import com.carbon.backend.model.PasswordResetToken;
import com.carbon.backend.repository.PasswordResetTokenRepository;
import jakarta.transaction.Transactional;
import java.util.UUID;
import java.util.Random;
import org.springframework.beans.factory.annotation.Value;
import com.carbon.backend.model.EmailVerificationToken;
import com.carbon.backend.repository.EmailVerificationTokenRepository;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@Service
public class UserService {
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private PasswordResetTokenRepository tokenRepository;
    @Autowired private EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Autowired private EmailService emailService;

    @Transactional
    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) throw new RuntimeException("Email is already in use!");
        if (userRepository.existsByUsername(user.getUsername())) throw new RuntimeException("Username is already taken!");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setEnabled(false);
        user.setEmailVerified(false);
        User savedUser = userRepository.save(user);
        
        generateAndSendVerificationToken(savedUser);
        
        return savedUser;
    }
    
    private void generateAndSendVerificationToken(User user) {
        // Generate 6 digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        // Invalidate old tokens
        emailVerificationTokenRepository.deleteByUser(user);
        
        EmailVerificationToken token = new EmailVerificationToken(otp, user);
        emailVerificationTokenRepository.save(token);
        
        emailService.sendVerificationEmail(user.getEmail(), otp);
    }
    
    @Transactional
    public void verifyEmail(String email, String code) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.isEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }
        
        EmailVerificationToken token = emailVerificationTokenRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Verification code not found"));
                
        if (!token.getVerificationCode().equals(code)) {
            throw new RuntimeException("Invalid verification code");
        }
        if (token.isExpired()) {
            throw new RuntimeException("Verification code has expired");
        }
        
        user.setEmailVerified(true);
        user.setEnabled(true);
        userRepository.save(user);
        
        emailVerificationTokenRepository.delete(token);
        
        emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());
    }
    
    @Transactional
    public void resendVerificationCode(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.isEmailVerified()) {
            throw new RuntimeException("Email is already verified");
        }
        
        // Rate limiting check (e.g. wait at least 60 seconds)
        emailVerificationTokenRepository.findByUser(user).ifPresent(t -> {
            if (t.getCreatedAt().plusMinutes(1).isAfter(java.time.LocalDateTime.now())) {
                throw new RuntimeException("Please wait before requesting a new code");
            }
        });
        
        generateAndSendVerificationToken(user);
    }
    
    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional
    public void generatePasswordResetToken(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        String resetTokenStr = UUID.randomUUID().toString();
        PasswordResetToken resetToken = tokenRepository.findByUser(user)
                .orElse(new PasswordResetToken(resetTokenStr, user));
                
        resetToken.setToken(resetTokenStr);
        resetToken.setExpiresAt(java.time.LocalDateTime.now().plusMinutes(30));
        tokenRepository.save(resetToken);
        
        String resetLink = frontendUrl + "/reset-password?token=" + resetTokenStr;
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }
    
    @Transactional
    public void resetPasswordWithToken(String tokenStr, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(tokenStr)
            .orElseThrow(() -> new RuntimeException("Invalid or missing token"));
            
        if (resetToken.isExpired()) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Token has expired");
        }
        
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
        
        emailService.sendPasswordChangedEmail(user.getEmail());
    }

    @Value("${google.client.id}")
    private String googleClientId;

    @Transactional
    public User googleSignIn(String idToken) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
        try {
            Map<String, Object> payload = restTemplate.getForObject(url, Map.class);
            if (payload == null || !payload.containsKey("email")) {
                throw new RuntimeException("Invalid Google token");
            }
            
            String aud = (String) payload.get("aud");
            if (!googleClientId.equals("YOUR_GOOGLE_CLIENT_ID") && !googleClientId.equals(aud)) {
                throw new RuntimeException("Invalid Google Client ID Audience");
            }
            
            String email = (String) payload.get("email");
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");
            
            Optional<User> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent()) {
                return existingUser.get();
            } else {
                User user = new User();
                user.setEmail(email);
                // Create a unique username from email
                String baseUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
                user.setUsername(baseUsername + "_" + new Random().nextInt(9999));
                // Set secure random password
                user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                user.setEnabled(true); // Google emails are pre-verified
                user.setEmailVerified(true);
                user.setProfilePicture(picture);
                user.setRole("USER");
                user.setStatus("ACTIVE");
                User savedUser = userRepository.save(user);
                
                emailService.sendWelcomeEmail(savedUser.getEmail(), savedUser.getUsername());
                return savedUser;
            }
        } catch (Exception e) {
            throw new RuntimeException("Google Sign-In failed: " + e.getMessage());
        }
    }
}
