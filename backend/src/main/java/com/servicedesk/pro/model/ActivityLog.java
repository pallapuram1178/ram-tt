package com.servicedesk.pro.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ticket_activity_logs")
public class ActivityLog {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 150)
    private String action;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "performed_by_user_id")
    private User performedBy;

    @Column(length = 1000)
    private String details = "";

    private Instant timestamp;

    public ActivityLog() {
        this.id = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        this.timestamp = Instant.now();
    }

    public ActivityLog(String action, User performedBy, String details, Instant timestamp) {
        this.id = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        this.action = action;
        this.performedBy = performedBy;
        this.details = details != null ? details : "";
        this.timestamp = timestamp != null ? timestamp : Instant.now();
    }

    @PrePersist
    public void onPrePersist() {
        if (this.id == null || this.id.isBlank()) {
            this.id = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        }
        if (this.timestamp == null) {
            this.timestamp = Instant.now();
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

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public User getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(User performedBy) {
        this.performedBy = performedBy;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
