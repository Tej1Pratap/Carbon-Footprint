package com.carbon.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

public class ChatDTOs {

    @Data
    public static class ChatRequest {
        private String message;
        private String language; // e.g. "en", "hi", "gu"
    }

    @Data
    public static class ChatResponse {
        private String response;
        private Long sessionId;
    }

    @Data
    public static class MessageDTO {
        private Long id;
        private String sender;
        private String content;
        private LocalDateTime timestamp;
    }

    @Data
    public static class ChatHistoryResponse {
        private Long sessionId;
        private List<MessageDTO> messages;
    }
}
