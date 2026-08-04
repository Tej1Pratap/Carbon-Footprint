package com.carbon.backend.controller;

import com.carbon.backend.model.Goal;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.UserRepository;
import com.carbon.backend.service.GoalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/goals")
public class GoalController {
    
    @Autowired private GoalService goalService;
    @Autowired private UserRepository userRepo;

    @GetMapping
    public ResponseEntity<?> getGoals(Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(goalService.getEnrichedGoals(user));
    }

    @PostMapping
    public ResponseEntity<?> addGoal(@RequestBody Goal goal, Authentication auth) {
        User user = userRepo.findByEmail(auth.getName()).orElseThrow();
        return ResponseEntity.ok(goalService.createGoal(user, goal));
    }
}
