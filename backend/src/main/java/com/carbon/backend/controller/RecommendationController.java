package com.carbon.backend.controller;

import com.carbon.backend.model.User;
import com.carbon.backend.repository.UserRepository;
import com.carbon.backend.service.RecommendationEngine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private RecommendationEngine recommendationEngine;

    @GetMapping
    public ResponseEntity<?> getRecommendations(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(recommendationEngine.generateRecommendations(user));
    }
}
