package com.servicedesk.pro.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String ticketId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 4000)
    private String description;

    @Column(nullable = false, length = 60)
    private String category = "Software";

    @Column(nullable = false, length = 30)
    private String priority = "Medium";

    @Column(nullable = false, length = 30)
    private String status = "Open";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedTo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id")
    private Asset assetId;

    @Column(nullable = false, length = 40)
    private String source = "Portal";

    @Column(nullable = false)
    private Instant slaDeadline;

    @Column(nullable = false, length = 30)
    private String slaStatus = "Within SLA";

    @Column(length = 2000)
    private String resolutionNotes = "";

    private Instant resolvedAt;
    private Instant closedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "ticket_tags", joinColumns = @JoinColumn(name = "ticket_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "ticket_id")
    @OrderBy("createdAt ASC")
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "ticket_id")
    @OrderBy("timestamp ASC")
    private List<ActivityLog> activityLog = new ArrayList<>();

    private boolean aiTroubleshootingAttempted = false;

    @Column(length = 2000)
    private String aiSummary = "";

    private Instant createdAt;
    private Instant updatedAt;

    public Ticket() {
        this.id = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        this.slaDeadline = Instant.now().plus(Duration.ofHours(24));
    }

    @PrePersist
    public void onPrePersist() {
        if (this.id == null || this.id.isBlank()) {
            this.id = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.slaDeadline == null) {
            int hours = switch (this.priority) {
                case "Urgent" -> 4;
                case "High" -> 12;
                case "Low" -> 48;
                default -> 24;
            };
            this.slaDeadline = Instant.now().plus(Duration.ofHours(hours));
        }
        this.updatedAt = Instant.now();
        checkAndUpdateSLA();
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = Instant.now();
        checkAndUpdateSLA();
    }

    public void checkAndUpdateSLA() {
        if ("Resolved".equalsIgnoreCase(this.status) || "Closed".equalsIgnoreCase(this.status)) {
            if (this.resolvedAt != null && this.resolvedAt.isAfter(this.slaDeadline)) {
                this.slaStatus = "Breached";
            } else {
                this.slaStatus = "Within SLA";
            }
            return;
        }

        Instant now = Instant.now();
        if (now.isAfter(this.slaDeadline)) {
            this.slaStatus = "Breached";
        } else {
            long hoursRemaining = Duration.between(now, this.slaDeadline).toHours();
            if (hoursRemaining < 4) {
                this.slaStatus = "At Risk";
            } else {
                this.slaStatus = "Within SLA";
            }
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @JsonProperty("_id")
    public String get_id() {
        return id;
    }

    public String getTicketId() {
        return ticketId;
    }

    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }

    public Asset getAssetId() {
        return assetId;
    }

    public void setAssetId(Asset assetId) {
        this.assetId = assetId;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Instant getSlaDeadline() {
        return slaDeadline;
    }

    public void setSlaDeadline(Instant slaDeadline) {
        this.slaDeadline = slaDeadline;
    }

    public String getSlaStatus() {
        return slaStatus;
    }

    public void setSlaStatus(String slaStatus) {
        this.slaStatus = slaStatus;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public Instant getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(Instant resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public Instant getClosedAt() {
        return closedAt;
    }

    public void setClosedAt(Instant closedAt) {
        this.closedAt = closedAt;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public List<ActivityLog> getActivityLog() {
        return activityLog;
    }

    public void setActivityLog(List<ActivityLog> activityLog) {
        this.activityLog = activityLog;
    }

    public boolean isAiTroubleshootingAttempted() {
        return aiTroubleshootingAttempted;
    }

    public void setAiTroubleshootingAttempted(boolean aiTroubleshootingAttempted) {
        this.aiTroubleshootingAttempted = aiTroubleshootingAttempted;
    }

    public String getAiSummary() {
        return aiSummary;
    }

    public void setAiSummary(String aiSummary) {
        this.aiSummary = aiSummary;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
