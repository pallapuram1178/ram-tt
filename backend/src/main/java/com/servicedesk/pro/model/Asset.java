package com.servicedesk.pro.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "assets")
public class Asset {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, unique = true, length = 50)
    private String assetTag;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, length = 60)
    private String category = "Laptop";

    @Column(nullable = false, length = 200)
    private String model;

    @Column(nullable = false, length = 120)
    private String serialNumber;

    @Column(length = 150)
    private String vendor = "Apple / Dell / Lenovo / Microsoft";

    @Column(nullable = false, length = 50)
    private String status = "In Storage";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedTo;

    @Column(length = 80)
    private String assignedDepartment = "IT Support";

    private Instant purchaseDate;

    private double purchaseCost = 0.0;

    @Column(nullable = false)
    private Instant warrantyExpiry;

    @Column(length = 150)
    private String location = "Main Office - Building A";

    @Embedded
    private AssetSpecifications specifications = new AssetSpecifications();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id")
    private List<RepairRecord> repairHistory = new ArrayList<>();

    @Column(length = 2000)
    private String notes = "";

    private Instant createdAt;
    private Instant updatedAt;

    public Asset() {
        this.id = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        this.purchaseDate = Instant.now();
        this.warrantyExpiry = Instant.now().plusSeconds(365 * 24 * 3600);
    }

    @PrePersist
    public void onPrePersist() {
        if (this.id == null || this.id.isBlank()) {
            this.id = UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        }
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.purchaseDate == null) {
            this.purchaseDate = Instant.now();
        }
        if (this.warrantyExpiry == null) {
            this.warrantyExpiry = Instant.now().plusSeconds(365 * 24 * 3600);
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

    public String getAssetTag() {
        return assetTag;
    }

    public void setAssetTag(String assetTag) {
        this.assetTag = assetTag;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getVendor() {
        return vendor;
    }

    public void setVendor(String vendor) {
        this.vendor = vendor;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public User getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(User assignedTo) {
        this.assignedTo = assignedTo;
    }

    public String getAssignedDepartment() {
        return assignedDepartment;
    }

    public void setAssignedDepartment(String assignedDepartment) {
        this.assignedDepartment = assignedDepartment;
    }

    public Instant getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(Instant purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public double getPurchaseCost() {
        return purchaseCost;
    }

    public void setPurchaseCost(double purchaseCost) {
        this.purchaseCost = purchaseCost;
    }

    public Instant getWarrantyExpiry() {
        return warrantyExpiry;
    }

    public void setWarrantyExpiry(Instant warrantyExpiry) {
        this.warrantyExpiry = warrantyExpiry;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public AssetSpecifications getSpecifications() {
        return specifications;
    }

    public void setSpecifications(AssetSpecifications specifications) {
        this.specifications = specifications;
    }

    public List<RepairRecord> getRepairHistory() {
        return repairHistory;
    }

    public void setRepairHistory(List<RepairRecord> repairHistory) {
        this.repairHistory = repairHistory;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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
