package com.carbon.backend.service;

import com.carbon.backend.dto.ChatDTOs.ChatRequest;
import com.carbon.backend.dto.ChatDTOs.ChatResponse;
import com.carbon.backend.dto.ChatDTOs.MessageDTO;
import com.carbon.backend.model.ChatMessage;
import com.carbon.backend.model.ChatSession;
import com.carbon.backend.model.User;
import com.carbon.backend.model.ActivityLog;
import com.carbon.backend.model.Goal;
import com.carbon.backend.repository.ChatMessageRepository;
import com.carbon.backend.repository.ChatSessionRepository;
import com.carbon.backend.repository.UserRepository;
import com.carbon.backend.repository.ActivityLogRepository;
import com.carbon.backend.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired private ChatSessionRepository chatSessionRepository;
    @Autowired private ChatMessageRepository chatMessageRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ActivityLogRepository activityLogRepository;
    @Autowired private GoalRepository goalRepository;
    @Autowired private AiIntegrationService aiIntegrationService;

    public ChatSession getOrCreateSession(Long userId) {
        return chatSessionRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId)
                .orElseGet(() -> {
                    ChatSession newSession = new ChatSession();
                    newSession.setUserId(userId);
                    return chatSessionRepository.save(newSession);
                });
    }

    public List<MessageDTO> getHistory(Long userId) {
        ChatSession session = getOrCreateSession(userId);
        return chatMessageRepository.findBySessionIdOrderByTimestampAsc(session.getId())
                .stream().map(msg -> {
                    MessageDTO dto = new MessageDTO();
                    dto.setId(msg.getId());
                    dto.setSender(msg.getSender());
                    dto.setContent(msg.getContent());
                    dto.setTimestamp(msg.getTimestamp());
                    return dto;
                }).collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public void clearHistory(Long userId) {
        // Manual delete logic to avoid foreign key constraints:
        ChatSession session = chatSessionRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId).orElse(null);
        if (session != null) {
            List<ChatMessage> msgs = chatMessageRepository.findBySessionIdOrderByTimestampAsc(session.getId());
            chatMessageRepository.deleteAll(msgs);
            chatSessionRepository.delete(session);
        }
    }

    public ChatResponse processMessage(Long userId, ChatRequest request) {
        ChatSession session = getOrCreateSession(userId);
        User user = userRepository.findById(userId).orElseThrow();

        // 1. Save User Message
        ChatMessage userMsg = new ChatMessage();
        userMsg.setSession(session);
        userMsg.setSender("USER");
        userMsg.setContent(request.getMessage());
        chatMessageRepository.save(userMsg);

        // 2. Build Context
        List<ActivityLog> logs = activityLogRepository.findByUserId(user.getId());
        List<Goal> goals = goalRepository.findByUserId(user.getId());
        
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate yesterday = today.minusDays(1);
        java.time.LocalDate startOfWeek = today.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        java.time.LocalDate startOfMonth = today.withDayOfMonth(1);

        double totalEmissions = 0;
        double todayEmissions = 0;
        double yesterdayEmissions = 0;
        double thisWeekEmissions = 0;
        double thisMonthEmissions = 0;

        java.util.Map<java.time.LocalDate, Double> dailyEmissionsMap = new java.util.HashMap<>();
        for (ActivityLog log : logs) {
            double em = log.getEmissionsKgCo2();
            totalEmissions += em;
            if (log.getLogDate() != null) {
                java.time.LocalDate logDate = log.getLogDate().toLocalDate();
                if (logDate.equals(today)) todayEmissions += em;
                if (logDate.equals(yesterday)) yesterdayEmissions += em;
                if (!logDate.isBefore(startOfWeek) && !logDate.isAfter(today)) thisWeekEmissions += em;
                if (!logDate.isBefore(startOfMonth) && !logDate.isAfter(today)) thisMonthEmissions += em;
                dailyEmissionsMap.put(logDate, dailyEmissionsMap.getOrDefault(logDate, 0.0) + em);
            }
        }
        
        java.time.LocalDate highestEmissionDate = null;
        double maxDailyEmission = 0.0;
        for (java.util.Map.Entry<java.time.LocalDate, Double> entry : dailyEmissionsMap.entrySet()) {
            if (entry.getValue() > maxDailyEmission) {
                maxDailyEmission = entry.getValue();
                highestEmissionDate = entry.getKey();
            }
        }
        
        List<ActivityLog> recentLogs = logs.stream()
                .filter(l -> l.getLogDate() != null)
                .sorted((a, b) -> b.getLogDate().compareTo(a.getLogDate()))
                .limit(5)
                .collect(Collectors.toList());

        StringBuilder context = new StringBuilder();
        
        if ("ADMIN".equals(user.getRole())) {
            context.append("You are the Super Admin Assistant for the EcoTrack Carbon Footprint app.\n");
            context.append("User Name: ").append(user.getUsername()).append(" (ADMIN)\n");
            context.append("--- SYSTEM DATA ---\n");
            context.append(String.format("Total Registered Users on Platform: %d\n", userRepository.count()));
            context.append(String.format("Total Activity Logs on Platform: %d\n", activityLogRepository.count()));
            context.append("-----------------\n");
            context.append("As an admin assistant, you should help the admin manage the platform, answer questions about system statistics, and provide guidance on admin tools like user management, emission factors, and reports.\n");
        } else {
            context.append("You are an AI Sustainability Assistant for a Carbon Footprint tracking app.\n");
            context.append("User Name: ").append(user.getUsername()).append("\n");
            context.append("--- USER DATA ---\n");
            context.append(String.format("Total Activities Logged: %d\n", logs.size()));
            context.append(String.format("Total Carbon Footprint: %.2f kg CO2\n", totalEmissions));
            context.append(String.format("Today's Emissions: %.2f kg CO2\n", todayEmissions));
            context.append(String.format("Yesterday's Emissions: %.2f kg CO2\n", yesterdayEmissions));
            context.append(String.format("This Week's Emissions: %.2f kg CO2\n", thisWeekEmissions));
            context.append(String.format("This Month's Emissions: %.2f kg CO2\n", thisMonthEmissions));
            if (highestEmissionDate != null) {
                context.append(String.format("Highest Emission Date (Lifetime): %s with %.2f kg CO2\n", highestEmissionDate.toString(), maxDailyEmission));
            } else {
                context.append("Highest Emission Date (Lifetime): None\n");
            }
            context.append("Active Goals: ").append(goals.size()).append("\n");
            
            if (!recentLogs.isEmpty()) {
                context.append("5 Most Recent Logged Activities:\n");
                for (ActivityLog rl : recentLogs) {
                    context.append(String.format("- %s on %s: %.2f kg CO2\n", rl.getActivityType(), rl.getLogDate().toLocalDate().toString(), rl.getEmissionsKgCo2()));
                }
            } else {
                context.append("Recent Activities: None.\n");
            }
            context.append("-----------------\n");
        }

        context.append("\nUser requested language: ").append(request.getLanguage() != null ? request.getLanguage() : "en").append("\n");
        context.append("RULES FOR ANSWERING:\n");
        context.append("1. Keep answers concise, friendly, and under 3-4 sentences. Use emojis.\n");
        context.append("2. Answer in the requested language.\n");
        context.append("3. STRICT ANTI-HALLUCINATION RULE: When the user asks about their emissions (e.g. 'what is my emission today', 'yesterday's emission', 'my carbon footprint'), you MUST ONLY rely on the 'USER DATA' block provided above. Do NOT invent, guess, or hallucinate numbers or activities. If the value provided above is 0.0 or 0, or if no recent activities are listed, you MUST explicitly state that they have not logged any activity for that period. Be helpful but completely factual based on the data provided.\n");

        // 3. Get AI Response
        String aiResponseText = aiIntegrationService.generateResponse(context.toString(), request.getMessage());

        // 4. Save AI Message
        ChatMessage aiMsg = new ChatMessage();
        aiMsg.setSession(session);
        aiMsg.setSender("AI");
        aiMsg.setContent(aiResponseText);
        chatMessageRepository.save(aiMsg);

        // Update session timestamp
        chatSessionRepository.save(session);

        ChatResponse response = new ChatResponse();
        response.setResponse(aiResponseText);
        response.setSessionId(session.getId());
        return response;
    }

    public ChatResponse processPublicMessage(ChatRequest request) {
        StringBuilder context = new StringBuilder();
        context.append("You are an AI Assistant for the EcoTrack Carbon Footprint website.\n");
        context.append("You are talking to a public visitor on the landing page.\n");
        context.append("Information about the platform:\n");
        context.append("- EcoTrack helps users log their daily activities, track carbon emissions, set sustainability goals, and compete on leaderboards.\n");
        context.append("- It has features like Activity Logging, Goal Tracking, Analytics, and Badges.\n");
        context.append("- Users can register for free.\n");
        context.append("\nUser requested language: ").append(request.getLanguage() != null ? request.getLanguage() : "en").append("\n");
        context.append("RULES FOR ANSWERING:\n");
        context.append("1. Be highly enthusiastic, welcoming, and concise (under 3 sentences). Use emojis.\n");
        context.append("2. Encourage the user to sign up or register to start tracking their footprint.\n");
        context.append("3. If they ask about specific data (like 'what is my footprint'), tell them they need to create an account and log in first.\n");
        context.append("4. Answer in the requested language.\n");

        String aiResponseText = aiIntegrationService.generateResponse(context.toString(), request.getMessage());
        
        ChatResponse response = new ChatResponse();
        response.setResponse(aiResponseText);
        // Public chat has no saved session history
        response.setSessionId(0L);
        
        return response;
    }
}
