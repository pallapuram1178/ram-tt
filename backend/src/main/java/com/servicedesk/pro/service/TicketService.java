package com.servicedesk.pro.service;

import com.servicedesk.pro.dto.PaginatedResponse;
import com.servicedesk.pro.dto.TicketDto;
import com.servicedesk.pro.model.*;
import com.servicedesk.pro.repository.AssetRepository;
import com.servicedesk.pro.repository.NotificationRepository;
import com.servicedesk.pro.repository.TicketRepository;
import com.servicedesk.pro.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final NotificationRepository notificationRepository;

    public TicketService(TicketRepository ticketRepository,
                         UserRepository userRepository,
                         AssetRepository assetRepository,
                         NotificationRepository notificationRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.assetRepository = assetRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public PaginatedResponse<Ticket> getTickets(
            User currentUser,
            String status,
            String priority,
            String category,
            String assignedTo,
            String search,
            String slaStatus,
            String scope,
            int page,
            int limit,
            String sortBy,
            String sortOrder
    ) {
        int pageIndex = Math.max(0, page - 1);
        int pageSize = limit > 0 ? limit : 20;

        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortProperty = (sortBy != null && !sortBy.isBlank()) ? sortBy : "createdAt";
        if ("id".equalsIgnoreCase(sortProperty)) sortProperty = "createdAt";

        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(direction, sortProperty));

        Specification<Ticket> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Scoping
            if ("Employee".equalsIgnoreCase(currentUser.getRole())) {
                predicates.add(cb.equal(root.get("createdBy").get("id"), currentUser.getId()));
            } else if ("created-by-me".equalsIgnoreCase(scope)) {
                predicates.add(cb.equal(root.get("createdBy").get("id"), currentUser.getId()));
            } else if ("assigned-to-me".equalsIgnoreCase(scope)) {
                predicates.add(cb.equal(root.get("assignedTo").get("id"), currentUser.getId()));
            }

            if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (priority != null && !priority.isBlank() && !"all".equalsIgnoreCase(priority)) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }

            if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (assignedTo != null && !assignedTo.isBlank() && !"all".equalsIgnoreCase(assignedTo)) {
                if ("unassigned".equalsIgnoreCase(assignedTo)) {
                    predicates.add(cb.isNull(root.get("assignedTo")));
                } else {
                    predicates.add(cb.equal(root.get("assignedTo").get("id"), assignedTo));
                }
            }

            if (slaStatus != null && !slaStatus.isBlank() && !"all".equalsIgnoreCase(slaStatus)) {
                predicates.add(cb.equal(root.get("slaStatus"), slaStatus));
            }

            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate searchPred = cb.or(
                        cb.like(cb.lower(root.get("ticketId")), searchPattern),
                        cb.like(cb.lower(root.get("title")), searchPattern),
                        cb.like(cb.lower(root.get("description")), searchPattern)
                );
                predicates.add(searchPred);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Ticket> pageResult = ticketRepository.findAll(spec, pageable);

        for (Ticket t : pageResult.getContent()) {
            t.checkAndUpdateSLA();
        }

        PaginatedResponse<Ticket> response = new PaginatedResponse<>(
                pageResult.getNumberOfElements(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                page,
                pageResult.getContent()
        );

        return response;
    }

    private Ticket findTicket(String id) {
        if (id.startsWith("TICK-")) {
            return ticketRepository.findByTicketId(id)
                    .orElseThrow(() -> new NoSuchElementException("Ticket not found"));
        }
        return ticketRepository.findById(id)
                .orElseGet(() -> ticketRepository.findByTicketId(id)
                        .orElseThrow(() -> new NoSuchElementException("Ticket not found")));
    }

    @Transactional
    public Ticket getTicketById(String id, User currentUser) {
        Ticket ticket = findTicket(id);

        if ("Employee".equalsIgnoreCase(currentUser.getRole())
                && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new SecurityException("You are not authorized to view this ticket.");
        }

        ticket.checkAndUpdateSLA();
        ticketRepository.save(ticket);

        if ("Employee".equalsIgnoreCase(currentUser.getRole())) {
            ticket.setComments(ticket.getComments().stream().filter(c -> !c.isInternal()).toList());
        }

        return ticket;
    }

    @Transactional
    public synchronized Ticket createTicket(TicketDto.CreateTicketRequest req, User currentUser) {
        String nextTicketId = generateNextTicketId();

        int hours = switch (req.getPriority() != null ? req.getPriority() : "Medium") {
            case "Urgent" -> 4;
            case "High" -> 12;
            case "Low" -> 48;
            default -> 24;
        };
        Instant slaDeadline = Instant.now().plus(Duration.ofHours(hours));

        Asset asset = null;
        if (req.getAssetId() != null && !req.getAssetId().isBlank()) {
            asset = assetRepository.findById(req.getAssetId()).orElse(null);
        }

        Ticket ticket = new Ticket();
        ticket.setTicketId(nextTicketId);
        ticket.setTitle(req.getTitle());
        ticket.setDescription(req.getDescription());
        ticket.setCategory(req.getCategory() != null ? req.getCategory() : "Software");
        ticket.setPriority(req.getPriority() != null ? req.getPriority() : "Medium");
        ticket.setStatus("Open");
        ticket.setCreatedBy(currentUser);
        ticket.setAssetId(asset);
        ticket.setSource(req.getSource() != null ? req.getSource() : "Portal");
        ticket.setSlaDeadline(slaDeadline);
        ticket.setSlaStatus("Within SLA");
        ticket.setAiTroubleshootingAttempted(req.isAiTroubleshootingAttempted());
        ticket.setAiSummary(req.getAiSummary() != null ? req.getAiSummary() : "");
        ticket.setTags(req.getTags() != null ? new ArrayList<>(req.getTags()) : new ArrayList<>());

        ActivityLog log = new ActivityLog(
                "Ticket Created",
                currentUser,
                "Ticket submitted via " + ticket.getSource() + " with priority " + ticket.getPriority(),
                Instant.now()
        );
        ticket.getActivityLog().add(log);

        Ticket saved = ticketRepository.save(ticket);

        // Notifications
        try {
            List<User> managers = userRepository.findByRoleInAndIsActiveTrueOrderByNameAsc(Arrays.asList("IT Manager", "Admin"));
            for (User mgr : managers) {
                notificationRepository.save(new Notification(
                        mgr,
                        "📋 Action Required: Assign " + saved.getTicketId(),
                        "Employee " + currentUser.getName() + " raised \"" + saved.getTitle() + "\" (" + saved.getPriority() + "). Review and assign a technician.",
                        "TICKET_CREATED",
                        "/tickets/" + saved.getId()
                ));
            }

            notificationRepository.save(new Notification(
                    currentUser,
                    "Ticket " + saved.getTicketId() + " Submitted",
                    "Your ticket \"" + saved.getTitle() + "\" has been sent to IT Management for review and technician dispatch.",
                    "TICKET_CREATED",
                    "/tickets/" + saved.getId()
            ));
        } catch (Exception ignored) {}

        return saved;
    }

    @Transactional
    public Ticket updateTicket(String id, TicketDto.UpdateTicketRequest req, User currentUser) {
        Ticket ticket = findTicket(id);

        if ("Employee".equalsIgnoreCase(currentUser.getRole())
                && !ticket.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new SecurityException("Not authorized to edit this ticket.");
        }

        List<String> changes = new ArrayList<>();
        if (req.getTitle() != null && !req.getTitle().equals(ticket.getTitle())) {
            changes.add("Title changed from \"" + ticket.getTitle() + "\" to \"" + req.getTitle() + "\"");
            ticket.setTitle(req.getTitle());
        }
        if (req.getDescription() != null && !req.getDescription().equals(ticket.getDescription())) {
            changes.add("Description updated");
            ticket.setDescription(req.getDescription());
        }
        if (req.getCategory() != null && !req.getCategory().equals(ticket.getCategory())) {
            changes.add("Category changed from " + ticket.getCategory() + " to " + req.getCategory());
            ticket.setCategory(req.getCategory());
        }
        if (req.getPriority() != null && !req.getPriority().equals(ticket.getPriority())) {
            changes.add("Priority changed from " + ticket.getPriority() + " to " + req.getPriority());
            ticket.setPriority(req.getPriority());
            int hours = switch (req.getPriority()) {
                case "Urgent" -> 4;
                case "High" -> 12;
                case "Low" -> 48;
                default -> 24;
            };
            ticket.setSlaDeadline(Instant.now().plus(Duration.ofHours(hours)));
        }
        if (req.getAssetId() != null) {
            Asset asset = req.getAssetId().isBlank() ? null : assetRepository.findById(req.getAssetId()).orElse(null);
            ticket.setAssetId(asset);
            changes.add("Associated asset updated");
        }

        if (!changes.isEmpty()) {
            ticket.getActivityLog().add(new ActivityLog(
                    "Ticket Details Updated",
                    currentUser,
                    String.join("; ", changes),
                    Instant.now()
            ));
        }

        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket assignTicket(String id, String technicianId, User currentUser) {
        Ticket ticket = findTicket(id);

        String technicianName = "Unassigned";
        if (technicianId != null && !technicianId.isBlank()) {
            User tech = userRepository.findById(technicianId)
                    .orElseThrow(() -> new NoSuchElementException("Technician not found"));
            ticket.setAssignedTo(tech);
            technicianName = tech.getName();

            if ("Open".equalsIgnoreCase(ticket.getStatus())) {
                ticket.setStatus("In Progress");
            }

            try {
                notificationRepository.save(new Notification(
                        tech,
                        "🚨 Ticket Assigned: " + ticket.getTicketId(),
                        currentUser.getName() + " (" + currentUser.getRole() + ") assigned ticket \"" + ticket.getTitle() + "\" (" + ticket.getPriority() + ") to you.",
                        "TICKET_ASSIGNED",
                        "/tickets/" + ticket.getId()
                ));

                if (!ticket.getCreatedBy().getId().equals(currentUser.getId())) {
                    notificationRepository.save(new Notification(
                            ticket.getCreatedBy(),
                            "Technician Dispatched for " + ticket.getTicketId(),
                            "IT Manager " + currentUser.getName() + " assigned technician " + technicianName + " to work on your issue.",
                            "TICKET_ASSIGNED",
                            "/tickets/" + ticket.getId()
                    ));
                }
            } catch (Exception ignored) {}
        } else {
            ticket.setAssignedTo(null);
        }

        ticket.getActivityLog().add(new ActivityLog(
                "Technician Assigned by IT Management",
                currentUser,
                "Assigned to " + technicianName + " by " + currentUser.getName() + " (" + currentUser.getRole() + ")",
                Instant.now()
        ));

        return ticketRepository.save(ticket);
    }

    @Transactional
    public Ticket updateTicketStatus(String id, String status, String resolutionNotes, User currentUser) {
        Ticket ticket = findTicket(id);

        if ("Employee".equalsIgnoreCase(currentUser.getRole())) {
            if (!"Closed".equalsIgnoreCase(status) && !"Reopened".equalsIgnoreCase(status)) {
                throw new SecurityException("Employees can only close or reopen their own tickets.");
            }
            if (!ticket.getCreatedBy().getId().equals(currentUser.getId())) {
                throw new SecurityException("Not authorized.");
            }
        }

        String prevStatus = ticket.getStatus();
        ticket.setStatus(status);

        if ("Resolved".equalsIgnoreCase(status)) {
            ticket.setResolvedAt(Instant.now());
            if (resolutionNotes != null && !resolutionNotes.isBlank()) {
                ticket.setResolutionNotes(resolutionNotes);
            }
        } else if ("Closed".equalsIgnoreCase(status)) {
            ticket.setClosedAt(Instant.now());
        } else if ("Reopened".equalsIgnoreCase(status)) {
            ticket.setResolvedAt(null);
            ticket.setClosedAt(null);
        }

        ticket.checkAndUpdateSLA();

        String details = "Status transitioned from " + prevStatus + " to " + status +
                ((resolutionNotes != null && !resolutionNotes.isBlank()) ? ". Resolution: " + resolutionNotes : "");

        ticket.getActivityLog().add(new ActivityLog(
                "Status Changed",
                currentUser,
                details,
                Instant.now()
        ));

        Ticket saved = ticketRepository.save(ticket);

        try {
            if (!ticket.getCreatedBy().getId().equals(currentUser.getId())) {
                notificationRepository.save(new Notification(
                        ticket.getCreatedBy(),
                        "Ticket " + ticket.getTicketId() + " Status: " + status,
                        "Your ticket \"" + ticket.getTitle() + "\" has been updated to " + status + ".",
                        "TICKET_UPDATED",
                        "/tickets/" + ticket.getId()
                ));
            }
        } catch (Exception ignored) {}

        return saved;
    }

    @Transactional
    public List<Comment> addComment(String id, TicketDto.AddCommentRequest req, User currentUser) {
        Ticket ticket = findTicket(id);

        boolean actualIsInternal = !"Employee".equalsIgnoreCase(currentUser.getRole()) && req.isInternal();

        Comment comment = new Comment(
                currentUser,
                req.getMessage(),
                actualIsInternal,
                req.getAttachments() != null ? new ArrayList<>(req.getAttachments()) : new ArrayList<>(),
                Instant.now()
        );

        ticket.getComments().add(comment);

        String snippet = req.getMessage().length() > 50 ? req.getMessage().substring(0, 47) + "..." : req.getMessage();
        ticket.getActivityLog().add(new ActivityLog(
                actualIsInternal ? "Internal Note Added" : "Public Comment Added",
                currentUser,
                "Comment posted: \"" + snippet + "\"",
                Instant.now()
        ));

        ticketRepository.save(ticket);

        if (!actualIsInternal) {
            try {
                User recipient = "Employee".equalsIgnoreCase(currentUser.getRole())
                        ? ticket.getAssignedTo()
                        : ticket.getCreatedBy();

                if (recipient != null && !recipient.getId().equals(currentUser.getId())) {
                    notificationRepository.save(new Notification(
                            recipient,
                            "New Comment on " + ticket.getTicketId(),
                            currentUser.getName() + " commented on \"" + ticket.getTitle() + "\"",
                            "COMMENT_ADDED",
                            "/tickets/" + ticket.getId()
                    ));
                }
            } catch (Exception ignored) {}
        }

        return ticket.getComments();
    }

    private synchronized String generateNextTicketId() {
        String maxId = ticketRepository.findMaxTicketId();
        int nextNum = 1001;
        if (maxId != null && maxId.startsWith("TICK-")) {
            try {
                int current = Integer.parseInt(maxId.substring(5));
                nextNum = current + 1;
            } catch (NumberFormatException ignored) {}
        }
        return "TICK-" + nextNum;
    }
}
