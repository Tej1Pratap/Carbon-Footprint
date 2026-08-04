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
        if (!userRepository.existsByEmail("admin@admin.com")) {
            User admin = new User();
            admin.setUsername("SuperAdmin");
            admin.setEmail("admin@admin.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMIN");
            admin.setStatus("ACTIVE");
            userRepository.save(admin);
            System.out.println("Default admin user created: admin@admin.com / admin123");
        }
    }
}
