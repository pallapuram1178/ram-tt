package com.servicedesk.pro.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "knowledge_base")
public class KnowledgeBase {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String articleId;

    @Column(nullable = false, length = 250)
    private String title;

    @Column(nullable = false, length = 60)
    private String category = "General IT";

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "kb_tags", joinColumns = @JoinColumn(name = "kb_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @Column(nullable = false, length = 1000)
    private String problemSummary;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "kb_symptoms", joinColumns = @JoinColumn(name = "kb_id"))
    @Column(name = "symptom")
    private List<String> symptoms = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "kb_solutions", joinColumns = @JoinColumn(name = "kb_id"))
    @Column(name = "step", length = 1000)
    private List<String> stepByStepSolution = new ArrayList<>();

    @Column(nullable = false, length = 8000)
    private String content;

    @Column(nullable = false, length = 30)
    private String status = "Approved";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_user_id", nullable = false)
    private User author;

    private int views = 0;
    private int helpfulVotes = 0;
    private int unhelpfulVotes = 0;

    private Instant createdAt;
    private Instant updatedAt;

    public KnowledgeBase() {
        this.id = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
    }

    @PrePersist
    public void onPrePersist() {
        if (this.id == null || this.id.isBlank()) {
            this.id = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void onPreUpdate() {
        this.updatedAt = Instant.now();
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

    public String getArticleId() {
        return articleId;
    }

    public void setArticleId(String articleId) {
        this.articleId = articleId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public String getProblemSummary() {
        return problemSummary;
    }

    public void setProblemSummary(String problemSummary) {
        this.problemSummary = problemSummary;
    }

    public List<String> getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(List<String> symptoms) {
        this.symptoms = symptoms;
    }

    public List<String> getStepByStepSolution() {
        return stepByStepSolution;
    }

    public void setStepByStepSolution(List<String> stepByStepSolution) {
        this.stepByStepSolution = stepByStepSolution;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public int getViews() {
        return views;
    }

    public void setViews(int views) {
        this.views = views;
    }

    public int getHelpfulVotes() {
        return helpfulVotes;
    }

    public void setHelpfulVotes(int helpfulVotes) {
        this.helpfulVotes = helpfulVotes;
    }

    public int getUnhelpfulVotes() {
        return unhelpfulVotes;
    }

    public void setUnhelpfulVotes(int unhelpfulVotes) {
        this.unhelpfulVotes = unhelpfulVotes;
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
