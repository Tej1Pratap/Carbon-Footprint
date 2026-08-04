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

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail("tejpratap11102@gmail.com")) {
            User admin = new User();
            admin.setUsername("SuperAdmin");
            admin.setEmail("tejpratap11102@gmail.com");
            admin.setPassword(passwordEncoder.encode("Tej@11"));
            admin.setRole("ADMIN");
            admin.setStatus("ACTIVE");
            admin.setEnabled(true);
            admin.setEmailVerified(true);
            userRepository.save(admin);
            System.out.println("Default admin user created: tejpratap11102@gmail.com / Tej@11");
        } else {
            User admin = userRepository.findByEmail("tejpratap11102@gmail.com").orElse(null);
            if (admin != null && (!admin.isEnabled() || !admin.isEmailVerified() || !"ADMIN".equals(admin.getRole()))) {
                admin.setRole("ADMIN");
                admin.setEnabled(true);
                admin.setEmailVerified(true);
                userRepository.save(admin);
                System.out.println("Updated existing user to be verified admin.");
            }
        }
    }
}
