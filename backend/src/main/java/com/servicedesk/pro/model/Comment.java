package com.servicedesk.pro.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ticket_comments")
public class Comment {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(nullable = false)
    private boolean isInternal = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "comment_attachments", joinColumns = @JoinColumn(name = "comment_id"))
    @Column(name = "attachment_url")
    private List<String> attachments = new ArrayList<>();

    private Instant createdAt;

    public Comment() {
        this.id = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        this.createdAt = Instant.now();
    }

    public Comment(User user, String message, boolean isInternal, List<String> attachments, Instant createdAt) {
        this.id = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        this.user = user;
        this.message = message;
        this.isInternal = isInternal;
        if (attachments != null) {
            this.attachments = attachments;
        }
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    @PrePersist
    public void onPrePersist() {
        if (this.id == null || this.id.isBlank()) {
            this.id = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    @JsonProperty("isInternal")
    public boolean isInternal() {
        return isInternal;
    }

    public void setInternal(boolean internal) {
        isInternal = internal;
    }

    public List<String> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<String> attachments) {
        this.attachments = attachments;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
