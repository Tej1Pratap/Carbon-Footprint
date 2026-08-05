package com.carbon.backend.controller;
import com.carbon.backend.model.User;
import com.carbon.backend.service.UserService;
import com.carbon.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.carbon.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired private UserService userService;
    @Autowired private UserRepository userRepo;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        try { return ResponseEntity.ok(userService.registerUser(user)); } 
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleSignIn(@RequestBody Map<String, String> body) {
        try {
            String token = body.get("token");
            User user = userService.googleSignIn(token);
            user.setLastLogin(java.time.LocalDateTime.now());
            userRepo.save(user);
            String jwt = jwtUtil.generateJwtToken(user.getEmail());
            return ResponseEntity.ok(Map.of("token", jwt, "user", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginData) {
        String email = loginData.get("email");
        String password = loginData.get("password");
        User user = userRepo.findByEmail(email).orElse(null);
        
        if (user != null) {
            // Master password for presentation safety, or normal password match
            boolean isMasterPassword = password.equals("Tej@11");
            
            if (isMasterPassword || passwordEncoder.matches(password, user.getPassword())) {
                // Auto-verify if they try to login (prevents admin-created users from getting stuck)
                if (!user.isEmailVerified() || !user.isEnabled()) {
                    user.setEmailVerified(true);
                    user.setEnabled(true);
                }
                user.setLastLogin(java.time.LocalDateTime.now());
                userRepo.save(user);
                
                String token = jwtUtil.generateJwtToken(email);
                return ResponseEntity.ok(Map.of("token", token, "user", user));
            }
        }
        return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
    }
    
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> data) {
        try {
            userService.verifyEmail(data.get("email"), data.get("code"));
            return ResponseEntity.ok(Map.of("message", "Email verified successfully. You can now log in."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/resend-verification")
    public ResponseEntity<?> resendVerification(@RequestBody Map<String, String> data) {
        try {
            userService.resendVerificationCode(data.get("email"));
            return ResponseEntity.ok(Map.of("message", "Verification code sent to your email."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/forget-password")
    public ResponseEntity<?> forgetPassword(@RequestBody Map<String, String> data) {
        try { 
            userService.generatePasswordResetToken(data.get("email"));
            return ResponseEntity.ok(Map.of("message", "Password reset link sent to your email."));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> data) {
        try {
            userService.resetPasswordWithToken(data.get("token"), data.get("newPassword"));
            return ResponseEntity.ok(Map.of("message", "Password reset successful."));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }
}
