package com.carbon.backend.controller;

import com.carbon.backend.dto.LeaderboardDTOs.*;
import com.carbon.backend.service.LeaderboardService;
import com.carbon.backend.model.User;
import com.carbon.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v2/leaderboard")
public class LeaderboardV2Controller {

    @Autowired private LeaderboardService leaderboardService;
    @Autowired private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getLeaderboard() {
        List<LeaderboardEntry> full = leaderboardService.getFullLeaderboard();
        List<LeaderboardEntry> publicBoard = full.stream()
                .filter(LeaderboardEntry::getPublicProfile)
                .collect(Collectors.toList());
        return ResponseEntity.ok(publicBoard);
    }

    @GetMapping("/top3")
    public ResponseEntity<?> getTop3() {
        List<LeaderboardEntry> full = leaderboardService.getFullLeaderboard();
        List<LeaderboardEntry> top3 = full.stream()
                .filter(LeaderboardEntry::getPublicProfile)
                .limit(3)
                .collect(Collectors.toList());
        return ResponseEntity.ok(top3);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyRank(Authentication auth) {
        if (auth == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(auth.getName()).orElse(null);
        if (user == null) return ResponseEntity.status(401).build();

        List<LeaderboardEntry> full = leaderboardService.getFullLeaderboard();
        
        Optional<LeaderboardEntry> myEntryOpt = full.stream()
                .filter(e -> e.getUserId().equals(user.getId()))
                .findFirst();

        if (myEntryOpt.isPresent()) {
            LeaderboardEntry myEntry = myEntryOpt.get();
            RankCard card = new RankCard();
            card.setCurrentRank(myEntry.getRank());
            card.setEcoPoints(myEntry.getEcoPoints());
            card.setCurrentStreak(myEntry.getCurrentStreak());
            card.setCarbonEmission(myEntry.getCarbonEmission());
            
            if (myEntry.getRank() > 1) {
                LeaderboardEntry nextEntry = full.get(myEntry.getRank() - 2); // 0 indexed
                card.setNextRank(myEntry.getRank() - 1);
                card.setPointsRequired(Math.max(0L, nextEntry.getEcoPoints() - myEntry.getEcoPoints() + 1));
                card.setMotivationalMessage("You are only " + card.getPointsRequired() + " Eco Points away from Rank #" + card.getNextRank() + "!");
            } else {
                card.setNextRank(1);
                card.setPointsRequired(0L);
                card.setMotivationalMessage("You are the #1 Eco Champion! Keep it up!");
            }
            return ResponseEntity.ok(card);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        List<LeaderboardEntry> full = leaderboardService.getFullLeaderboard();
        Optional<LeaderboardEntry> entry = full.stream()
                .filter(e -> e.getUserId().equals(id))
                .findFirst();
        if (entry.isPresent()) {
            return ResponseEntity.ok(entry.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/challenges")
    public ResponseEntity<?> getChallenges() {
        // Return some static community challenges
        return ResponseEntity.ok(List.of(
            Map.of("id", 1, "title", "Walk 20 KM", "points", 200, "progress", 60, "total", 100),
            Map.of("id", 2, "title", "Recycle 10 Items", "points", 150, "progress", 100, "total", 100),
            Map.of("id", 3, "title", "Plant 2 Trees", "points", 300, "progress", 0, "total", 100),
            Map.of("id", 4, "title", "No Private Vehicle Day", "points", 250, "progress", 30, "total", 100)
        ));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        List<LeaderboardEntry> full = leaderboardService.getFullLeaderboard();
        CommunityStats stats = new CommunityStats();
        stats.setTotalMembers(full.size());
        stats.setTotalCarbonSaved(full.stream().mapToDouble(LeaderboardEntry::getCarbonEmission).sum());
        stats.setAverageEmission(full.isEmpty() ? 0 : stats.getTotalCarbonSaved() / full.size());
        stats.setTodayActivities(full.stream().mapToInt(LeaderboardEntry::getActivitiesLogged).sum()); // Mocking as total for now
        stats.setCommunityGoal(10000);
        stats.setWeeklyChallengeProgress((stats.getTotalCarbonSaved() / 10000.0) * 100.0);
        return ResponseEntity.ok(stats);
    }
}
