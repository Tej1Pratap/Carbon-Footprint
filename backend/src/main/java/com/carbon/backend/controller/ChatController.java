package com.carbon.backend.controller;

import com.carbon.backend.dto.ChatDTOs.ChatRequest;
import com.carbon.backend.dto.ChatDTOs.ChatResponse;
import com.carbon.backend.dto.ChatDTOs.MessageDTO;
import com.carbon.backend.security.JwtUtil;
import com.carbon.backend.service.ChatService;
import com.carbon.backend.repository.UserRepository;
import com.carbon.backend.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin
public class ChatController {

    @Autowired private ChatService chatService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepository;

    private Long getUserIdFromToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            String email = jwtUtil.getUserEmailFromJwtToken(token);
            User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
            return user.getId();
        }
        throw new RuntimeException("Unauthorized");
    }

    @PostMapping("/send")
    public ResponseEntity<ChatResponse> sendMessage(HttpServletRequest request, @RequestBody ChatRequest chatRequest) {
        Long userId = getUserIdFromToken(request);
        return ResponseEntity.ok(chatService.processMessage(userId, chatRequest));
    }

    @GetMapping("/history")
    public ResponseEntity<List<MessageDTO>> getHistory(HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        return ResponseEntity.ok(chatService.getHistory(userId));
    }

    @DeleteMapping("/history")
    public ResponseEntity<?> clearHistory(HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        chatService.clearHistory(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/session")
    public ResponseEntity<?> createSession(HttpServletRequest request) {
        Long userId = getUserIdFromToken(request);
        return ResponseEntity.ok(chatService.getOrCreateSession(userId));
    }
}
