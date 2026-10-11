package com.servicedesk.pro.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "repair_records")
public class RepairRecord {

    @Id
    @Column(length = 64)
    private String id;

    private Instant date;

    @Column(nullable = false, length = 500)
    private String issue;

    private double cost = 0.0;

    @Column(length = 100)
    private String performedBy = "Internal IT Support";

    @Column(length = 50)
    private String status = "Completed";

    @Column(length = 1000)
    private String notes = "";

    public RepairRecord() {
        this.id = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        this.date = Instant.now();
    }

    public RepairRecord(String issue, double cost, String performedBy, String status, String notes, Instant date) {
        this.id = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        this.issue = issue;
        this.cost = cost;
        this.performedBy = performedBy != null ? performedBy : "Internal IT Support";
        this.status = status != null ? status : "Completed";
        this.notes = notes != null ? notes : "";
        this.date = date != null ? date : Instant.now();
    }

    @PrePersist
    public void onPrePersist() {
        if (this.id == null || this.id.isBlank()) {
            this.id = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        }
        if (this.date == null) {
            this.date = Instant.now();
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

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public String getIssue() {
        return issue;
    }

    public void setIssue(String issue) {
        this.issue = issue;
    }

    public double getCost() {
        return cost;
    }

    public void setCost(double cost) {
        this.cost = cost;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
