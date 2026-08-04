package com.carbon.backend.controller;

import com.carbon.backend.service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminGoalsController {

    @Autowired
    private GoalService goalService;

    @GetMapping("/goals")
    public ResponseEntity<?> getAllGoals(Authentication auth) {
        return ResponseEntity.ok(goalService.getAllEnrichedGoals());
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getGlobalRecommendations(Authentication auth) {
        return ResponseEntity.ok(goalService.getGlobalRecommendations());
    }
}
