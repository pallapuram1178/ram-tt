package com.servicedesk.pro.controller;

import com.servicedesk.pro.dto.ApiResponse;
import com.servicedesk.pro.dto.PaginatedResponse;
import com.servicedesk.pro.dto.TicketDto;
import com.servicedesk.pro.model.Comment;
import com.servicedesk.pro.model.Ticket;
import com.servicedesk.pro.model.User;
import com.servicedesk.pro.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<?> getTickets(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String slaStatus,
            @RequestParam(required = false) String scope,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder
    ) {
        PaginatedResponse<Ticket> response = ticketService.getTickets(
                currentUser, status, priority, category, assignedTo, search, slaStatus, scope, page, limit, sortBy, sortOrder
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            Ticket ticket = ticketService.getTicketById(id, currentUser);
            return ResponseEntity.ok(ApiResponse.success(ticket));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Ticket not found"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createTicket(
            @AuthenticationPrincipal User currentUser,
            @RequestBody TicketDto.CreateTicketRequest req
    ) {
        if (req.getTitle() == null || req.getTitle().isBlank() || req.getDescription() == null || req.getDescription().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Title and description are required"));
        }

        Ticket created = ticketService.createTicket(req, currentUser);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Ticket created and routed to IT Management for technician assignment.");
        resp.put("data", created);

        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTicket(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody TicketDto.UpdateTicketRequest req
    ) {
        try {
            Ticket updated = ticketService.updateTicket(id, req, currentUser);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Ticket updated successfully.");
            resp.put("data", updated);

            return ResponseEntity.ok(resp);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Ticket not found"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('Admin', 'IT_Manager', 'Technician')")
    public ResponseEntity<?> assignTicket(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody TicketDto.AssignTicketRequest req
    ) {
        try {
            Ticket assigned = ticketService.assignTicket(id, req.getTechnicianId(), currentUser);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Ticket " + assigned.getTicketId() + " successfully assigned");
            resp.put("data", assigned);

            return ResponseEntity.ok(resp);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTicketStatus(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody TicketDto.UpdateStatusRequest req
    ) {
        if (req.getStatus() == null || req.getStatus().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Status is required"));
        }

        try {
            Ticket updated = ticketService.updateTicketStatus(id, req.getStatus(), req.getResolutionNotes(), currentUser);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Ticket status updated to " + req.getStatus());
            resp.put("data", updated);

            return ResponseEntity.ok(resp);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Ticket not found"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody TicketDto.AddCommentRequest req
    ) {
        if (req.getMessage() == null || req.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Comment message is required."));
        }

        try {
            List<Comment> comments = ticketService.addComment(id, req, currentUser);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Comment added successfully.");
            resp.put("data", comments);

            return ResponseEntity.ok(resp);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Ticket not found"));
        }
    }
}
