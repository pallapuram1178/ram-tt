package com.servicedesk.pro.controller;

import com.servicedesk.pro.dto.AIDto;
import com.servicedesk.pro.dto.ApiResponse;
import com.servicedesk.pro.dto.TicketDto;
import com.servicedesk.pro.model.Ticket;
import com.servicedesk.pro.model.User;
import com.servicedesk.pro.service.AIService;
import com.servicedesk.pro.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;
    private final TicketService ticketService;

    public AIController(AIService aiService, TicketService ticketService) {
        this.aiService = aiService;
        this.ticketService = ticketService;
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chatWithAI(
            @AuthenticationPrincipal User currentUser,
            @RequestBody AIDto.ChatRequest req
    ) {
        if (req.getMessage() == null || req.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Message cannot be empty."));
        }

        AIDto.ChatResult result = aiService.processChat(req.getMessage(), req.getConversationHistory(), currentUser);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("data", result);

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/create-ticket")
    public ResponseEntity<?> createTicketFromChat(
            @AuthenticationPrincipal User currentUser,
            @RequestBody AIDto.CreateTicketFromChatRequest req
    ) {
        if (req.getTitle() == null || req.getTitle().isBlank() || req.getDescription() == null || req.getDescription().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Title and description are required to create a ticket."));
        }

        TicketDto.CreateTicketRequest ticketReq = new TicketDto.CreateTicketRequest();
        ticketReq.setTitle(req.getTitle());
        ticketReq.setDescription(req.getDescription());
        ticketReq.setCategory(req.getCategory() != null ? req.getCategory() : "Software");
        ticketReq.setPriority(req.getPriority() != null ? req.getPriority() : "Medium");
        ticketReq.setAssetId(req.getAssetId());
        ticketReq.setSource("AI Chatbot");
        ticketReq.setAiTroubleshootingAttempted(true);
        ticketReq.setAiSummary(req.getAiSummary() != null ? req.getAiSummary() : "Created automatically following AI Helpdesk troubleshooting session.");

        List<String> tags = new ArrayList<>();
        if (req.getTags() != null) {
            tags.addAll(req.getTags());
        }
        tags.add("AI-Assisted");
        tags.add("Chatbot-Escalation");
        ticketReq.setTags(tags);

        Ticket created = ticketService.createTicket(ticketReq, currentUser);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Support ticket successfully raised and sent to IT Management queue.");
        resp.put("data", created);

        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }
}
