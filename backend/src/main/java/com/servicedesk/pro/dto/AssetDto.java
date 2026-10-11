package com.servicedesk.pro.dto;

import com.servicedesk.pro.model.AssetSpecifications;
import java.time.Instant;

public class AssetDto {

    public static class CreateOrUpdateAssetRequest {
        private String name;
        private String category;
        private String model;
        private String serialNumber;
        private String vendor;
        private String status;
        private String assignedTo;
        private String assignedDepartment;
        private Instant purchaseDate;
        private Double purchaseCost;
        private Instant warrantyExpiry;
        private String location;
        private AssetSpecifications specifications;
        private String notes;

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

        public String getAssignedTo() {
            return assignedTo;
        }

        public void setAssignedTo(String assignedTo) {
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

        public Double getPurchaseCost() {
            return purchaseCost;
        }

        public void setPurchaseCost(Double purchaseCost) {
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

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }

    public static class AddRepairRequest {
        private String issue;
        private Double cost;
        private String performedBy;
        private String status = "Completed";
        private String notes;
        private Instant date;

        public String getIssue() {
            return issue;
        }

        public void setIssue(String issue) {
            this.issue = issue;
        }

        public Double getCost() {
            return cost;
        }

        public void setCost(Double cost) {
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

        public Instant getDate() {
            return date;
        }

        public void setDate(Instant date) {
            this.date = date;
        }
    }
}
