package com.carbon.backend.config;

import com.carbon.backend.model.User;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @org.springframework.beans.factory.annotation.Value("${admin.email}")
    private String adminEmail;

    @org.springframework.beans.factory.annotation.Value("${admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail(adminEmail)) {
            try {
                User admin = new User();
                admin.setUsername(adminEmail.split("@")[0] + "_admin");
                admin.setEmail(adminEmail);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole("ADMIN");
                admin.setStatus("ACTIVE");
                admin.setEnabled(true);
                admin.setEmailVerified(true);
                userRepository.save(admin);
                System.out.println("Default admin user created with provided credentials.");
            } catch (Exception e) {
                System.out.println("Could not create admin user (might already exist with different email/username): " + e.getMessage());
            }
        } else {
            User admin = userRepository.findByEmail(adminEmail).orElse(null);
            if (admin != null && (!admin.isEnabled() || !admin.isEmailVerified() || !"ADMIN".equals(admin.getRole()))) {
                admin.setRole("ADMIN");
                admin.setEnabled(true);
                admin.setEmailVerified(true);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                userRepository.save(admin);
                System.out.println("Updated existing user to be verified admin with provided password.");
            }
        }
    }
}
