package com.servicedesk.pro.dto;

import java.util.List;

public class TicketDto {

    public static class CreateTicketRequest {
        private String title;
        private String description;
        private String category;
        private String priority = "Medium";
        private String assetId;
        private String source = "Portal";
        private boolean aiTroubleshootingAttempted = false;
        private String aiSummary = "";
        private List<String> tags;

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

        public String getAssetId() {
            return assetId;
        }

        public void setAssetId(String assetId) {
            this.assetId = assetId;
        }

        public String getSource() {
            return source;
        }

        public void setSource(String source) {
            this.source = source;
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

        public List<String> getTags() {
            return tags;
        }

        public void setTags(List<String> tags) {
            this.tags = tags;
        }
    }

    public static class UpdateTicketRequest {
        private String title;
        private String description;
        private String category;
        private String priority;
        private String assetId;

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

        public String getAssetId() {
            return assetId;
        }

        public void setAssetId(String assetId) {
            this.assetId = assetId;
        }
    }

    public static class AssignTicketRequest {
        private String technicianId;

        public String getTechnicianId() {
            return technicianId;
        }

        public void setTechnicianId(String technicianId) {
            this.technicianId = technicianId;
        }
    }

    public static class UpdateStatusRequest {
        private String status;
        private String resolutionNotes;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public String getResolutionNotes() {
            return resolutionNotes;
        }

        public void setResolutionNotes(String resolutionNotes) {
            this.resolutionNotes = resolutionNotes;
        }
    }

    public static class AddCommentRequest {
        private String message;
        private boolean isInternal = false;
        private List<String> attachments;

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

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
    }
}
