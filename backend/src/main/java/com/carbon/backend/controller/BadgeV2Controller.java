package com.carbon.backend.controller;

import com.carbon.backend.dto.BadgeV2DTOs.DynamicBadgeStatus;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.UserRepository;
import com.carbon.backend.service.BadgeV2Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v2/badges")
public class BadgeV2Controller {

    @Autowired private BadgeV2Service badgeV2Service;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<DynamicBadgeStatus>> getDynamicBadges() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmail(auth.getName()).orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(badgeV2Service.calculateDynamicBadges(user.getId()));
    }
}
