package com.carbon.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${brevo.sender.email:${spring.mail.username:noreply@ecotrack.com}}")
    private String senderEmail;

    @Value("${brevo.sender.name:EcoTrack Security}")
    private String senderName;

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        if (brevoApiKey == null || brevoApiKey.trim().isEmpty()) {
            System.out.println("Email Sending Disabled: " + subject + " -> " + to);
            return;
        }
        
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://api.brevo.com/v3/smtp/email";

            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", brevoApiKey);
            headers.set("Content-Type", "application/json");

            Map<String, Object> body = new HashMap<>();
            body.put("sender", Map.of("name", senderName, "email", senderEmail));
            body.put("to", List.of(Map.of("email", to)));
            body.put("subject", subject);
            body.put("htmlContent", htmlContent);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            System.out.println("Email successfully sent via Brevo to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email via Brevo: " + e.getMessage());
        }
    }

    private String getHeader() {
        return "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;'>" +
               "<div style='background-color: #16a34a; padding: 20px; text-align: center;'>" +
               "<h1 style='color: white; margin: 0; font-size: 24px;'>Carbon Footprint Tracker</h1>" +
               "</div>" +
               "<div style='padding: 30px; background-color: #ffffff; color: #374151;'>";
    }

    private String getFooter() {
        return "</div>" +
               "<div style='background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;'>" +
               "<p>If you have any questions, please contact our support team.</p>" +
               "<p>&copy; 2026 Carbon Footprint Tracker. All rights reserved.</p>" +
               "</div></div>";
    }

    public void sendVerificationEmail(String to, String otp) {
        System.out.println("OTP FOR " + to + ": " + otp);
        String subject = "Verify your Email Address";
        String html = getHeader() +
                "<h2 style='color: #111827; margin-top: 0;'>Welcome!</h2>" +
                "<p>Thank you for registering. Please use the following 6-digit verification code to verify your email address. This code will expire in 10 minutes.</p>" +
                "<div style='background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center; margin: 25px 0;'>" +
                "<span style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #16a34a;'>" + otp + "</span>" +
                "</div>" +
                "<p>If you did not request this verification, please ignore this email.</p>" +
                getFooter();
        
        sendHtmlEmail(to, subject, html);
    }

    public void sendPasswordResetEmail(String to, String resetLink) {
        System.out.println("PASSWORD RESET LINK FOR " + to + ": " + resetLink);
        String subject = "Password Reset Request";
        String html = getHeader() +
                "<h2 style='color: #111827; margin-top: 0;'>Password Reset</h2>" +
                "<p>We received a request to reset your password. Click the button below to choose a new one:</p>" +
                "<div style='text-align: center; margin: 30px 0;'>" +
                "<a href='" + resetLink + "' style='background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>Reset Password</a>" +
                "</div>" +
                "<p>If you did not request a password reset, you can safely ignore this email. This link will expire in 30 minutes.</p>" +
                getFooter();
        
        sendHtmlEmail(to, subject, html);
    }

    public void sendPasswordChangedEmail(String to) {
        String subject = "Password Changed Successfully";
        String html = getHeader() +
                "<h2 style='color: #111827; margin-top: 0;'>Password Changed</h2>" +
                "<p>Your password has been successfully changed.</p>" +
                "<p>If you did not make this change, please contact support immediately to secure your account.</p>" +
                getFooter();
        
        sendHtmlEmail(to, subject, html);
    }

    public void sendGoalStatusEmail(String to, String username, com.carbon.backend.model.Goal goal, String status, java.util.List<java.util.Map<String, String>> recommendations) {
        String statusColor = status.equals("ON_TRACK") ? "#16a34a" : "#dc2626";
        String statusMessage = status.equals("ON_TRACK") ? 
            "Great job! You are currently on track to beat your emissions target." : 
            "Watch out! At your current rate, you will exceed your target emissions before the deadline.";
        String subject = status.equals("ON_TRACK") ? "✅ Goal Update: You're on track!" : "⚠️ Goal Alert: You're falling behind your target";

        StringBuilder html = new StringBuilder();
        html.append(getHeader());
        html.append("<h2 style='color: #111827; margin-top: 0;'>Hi ").append(username).append(",</h2>");
        html.append("<p>Here is an update on your sustainability goal: <strong>").append(goal.getDescription()).append("</strong></p>");
        
        html.append("<div style='background: ").append(status.equals("ON_TRACK") ? "#f0fdf4" : "#fef2f2").append("; padding: 15px; border-left: 5px solid ").append(statusColor).append("; border-radius: 8px; margin: 20px 0;'>");
        html.append("<h3 style='margin-top: 0; color: ").append(statusColor).append(";'>Status: ").append(status.replace("_", " ")).append("</h3>");
        html.append("<p style='margin-bottom: 0;'>").append(statusMessage).append("</p>");
        html.append("</div>");

        if (recommendations != null && !recommendations.isEmpty()) {
            html.append("<h3 style='color: #374151; margin-top: 30px;'>Top Emission Areas (Last 30 Days)</h3>");
            html.append("<p style='font-size: 14px; color: #6b7280;'>Based on your recent activity, here are customized recommendations to help you stay on track:</p>");
            
            for (java.util.Map<String, String> rec : recommendations) {
                html.append("<div style='background: #f9fafb; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 10px;'>");
                html.append("<strong style='display: block; font-size: 16px; margin-bottom: 5px;'>").append(rec.get("type").toUpperCase()).append("</strong>");
                html.append("<span style='font-size: 14px; color: #4b5563;'>").append(rec.get("tip")).append("</span>");
                html.append("</div>");
            }
        }
        
        html.append(getFooter());
        
        sendHtmlEmail(to, subject, html.toString());
    }

    public void sendBadgeEarnedEmail(String to, String username, String badgeName) {
        String subject = "🏆 Achievement Unlocked: " + badgeName + "!";
        
        StringBuilder html = new StringBuilder();
        html.append(getHeader());
        html.append("<h2 style='color: #111827; margin-top: 0;'>Congratulations, ").append(username).append("!</h2>");
        html.append("<p>You have just earned a new sustainability badge for your incredible dedication to the environment.</p>");
        
        html.append("<div style='background: #f0fdf4; padding: 25px; border: 2px solid #22c55e; border-radius: 12px; margin: 30px 0; text-align: center;'>");
        html.append("<h1 style='font-size: 40px; margin: 0; padding: 0;'>🌟</h1>");
        html.append("<h3 style='margin-top: 15px; color: #16a34a; font-size: 20px;'>").append(badgeName).append("</h3>");
        html.append("</div>");
        
        html.append("<p style='color: #4b5563;'>Keep logging your activities to unlock more badges and level up your Carbon Footprint ranking. Every action counts!</p>");
        html.append("<div style='text-align: center; margin: 30px 0;'>");
        html.append("<a href='http://localhost:5174/badges' style='background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>View My Badges</a>");
        html.append("</div>");
        
        html.append(getFooter());
        
        sendHtmlEmail(to, subject, html.toString());
    }
    public void sendSupportTicketEmail(String to, String username, String ticketId, String title, String problemDescription, String resolutionMessage, boolean isResolved) {
        String subject = isResolved ? "✅ Support Ticket Resolved: " + ticketId : "🎫 Support Ticket Update: " + ticketId;
        
        StringBuilder html = new StringBuilder();
        html.append(getHeader());
        html.append("<h2 style='color: #111827; margin-top: 0;'>Hi ").append(username).append(",</h2>");
        
        if (isResolved) {
            html.append("<p>Your support ticket <strong>").append(ticketId).append("</strong> has been marked as resolved.</p>");
            html.append("<div style='background-color: #f9fafb; padding: 15px; border-left: 4px solid #16a34a; margin: 20px 0;'>");
            html.append("<h3 style='margin-top: 0; color: #374151;'>Original Problem</h3>");
            html.append("<p style='color: #4b5563; white-space: pre-wrap;'>").append(problemDescription != null ? problemDescription : "N/A").append("</p>");
            html.append("</div>");

            html.append("<div style='background-color: #f0fdf4; padding: 15px; border-left: 4px solid #15803d; margin: 20px 0;'>");
            html.append("<h3 style='margin-top: 0; color: #166534;'>Resolution</h3>");
            html.append("<p style='color: #4b5563; white-space: pre-wrap;'>").append(resolutionMessage != null ? resolutionMessage : "Resolved by Admin.").append("</p>");
            html.append("</div>");
        } else {
            html.append("<p>We have received your support ticket <strong>").append(ticketId).append("</strong>: <em>").append(title).append("</em>.</p>");
            if (problemDescription != null && !problemDescription.isEmpty()) {
                html.append("<div style='background-color: #f9fafb; padding: 15px; border-left: 4px solid #6b7280; margin: 20px 0;'>");
                html.append("<h3 style='margin-top: 0; color: #374151;'>Problem Description</h3>");
                html.append("<p style='color: #4b5563; white-space: pre-wrap;'>").append(problemDescription).append("</p>");
                html.append("</div>");
            }
        }
        
        html.append("<p style='color: #4b5563;'>You can view your ticket and its status in the Support Center.</p>");
        html.append("<div style='text-align: center; margin: 30px 0;'>");
        html.append("<a href='http://localhost:5174/support' style='background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>View Ticket</a>");
        html.append("</div>");
        
        html.append(getFooter());
        
        sendHtmlEmail(to, subject, html.toString());
    }

    public void sendSupportReplyEmail(String to, String username, String ticketId) {
        String subject = "💬 New Reply on Ticket: " + ticketId;
        
        StringBuilder html = new StringBuilder();
        html.append(getHeader());
        html.append("<h2 style='color: #111827; margin-top: 0;'>Hi ").append(username).append(",</h2>");
        html.append("<p>You have received a new reply on your support ticket <strong>").append(ticketId).append("</strong>.</p>");
        
        html.append("<p style='color: #4b5563;'>Please log in to the Support Center to view and reply.</p>");
        html.append("<div style='text-align: center; margin: 30px 0;'>");
        html.append("<a href='http://localhost:5174/support' style='background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>View Reply</a>");
        html.append("</div>");
        
        html.append(getFooter());
        
        sendHtmlEmail(to, subject, html.toString());
    }

    public void sendAdminNewTicketEmail(String to, String ticketId, String category) {
        String subject = "🚨 New Support Ticket: " + ticketId;
        StringBuilder html = new StringBuilder();
        html.append(getHeader());
        html.append("<h2 style='color: #111827; margin-top: 0;'>Admin Alert</h2>");
        html.append("<p>A new support ticket has been created.</p>");
        html.append("<p><strong>Ticket ID:</strong> ").append(ticketId).append("<br><strong>Category:</strong> ").append(category).append("</p>");
        html.append("<div style='text-align: center; margin: 30px 0;'>");
        html.append("<a href='http://localhost:5174/admin/support' style='background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>View Admin Dashboard</a>");
        html.append("</div>");
        html.append(getFooter());
        sendHtmlEmail(to, subject, html.toString());
    }

    public void sendWelcomeEmail(String to, String username) {
        String subject = "👋 Welcome to EcoTrack, " + username + "!";
        StringBuilder html = new StringBuilder();
        html.append(getHeader());
        html.append("<h2 style='color: #111827; margin-top: 0;'>Welcome aboard, ").append(username).append("!</h2>");
        html.append("<p>We are thrilled to have you join EcoTrack. By registering, you've taken the first step towards a greener, more sustainable future.</p>");
        html.append("<div style='background-color: #f0fdf4; padding: 15px; border-left: 4px solid #16a34a; margin: 20px 0;'>");
        html.append("<h3 style='margin-top: 0; color: #166534;'>What's Next?</h3>");
        html.append("<p style='color: #4b5563; margin-bottom: 5px;'>1. Log your daily activities</p>");
        html.append("<p style='color: #4b5563; margin-bottom: 5px;'>2. Set sustainability goals</p>");
        html.append("<p style='color: #4b5563; margin-bottom: 0;'>3. Compete on the leaderboard!</p>");
        html.append("</div>");
        html.append("<div style='text-align: center; margin: 30px 0;'>");
        html.append("<a href='https://carbon-footprint-drab.vercel.app/dashboard' style='background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>Go to Dashboard</a>");
        html.append("</div>");
        html.append(getFooter());
        sendHtmlEmail(to, subject, html.toString());
    }
}
