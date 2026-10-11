package com.servicedesk.pro.dto;

import java.util.List;
import java.util.Map;

public class AIDto {

    public static class ChatRequest {
        private String message;
        private List<Map<String, Object>> conversationHistory;

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public List<Map<String, Object>> getConversationHistory() {
            return conversationHistory;
        }

        public void setConversationHistory(List<Map<String, Object>> conversationHistory) {
            this.conversationHistory = conversationHistory;
        }
    }

    public static class CreateTicketFromChatRequest {
        private String title;
        private String description;
        private String category = "Software";
        private String priority = "Medium";
        private String assetId;
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

    public static class Classification {
        private String category;
        private String priority;

        public Classification() {}

        public Classification(String category, String priority) {
            this.category = category;
            this.priority = priority;
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
    }

    public static class Source {
        private String articleId;
        private String title;
        private String category;

        public Source() {}

        public Source(String articleId, String title, String category) {
            this.articleId = articleId;
            this.title = title;
            this.category = category;
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
    }

    public static class TicketDraft {
        private String title;
        private String description;
        private String category;
        private String priority;
        private List<String> tags;
        private int slaHours;

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

        public List<String> getTags() {
            return tags;
        }

        public void setTags(List<String> tags) {
            this.tags = tags;
        }

        public int getSlaHours() {
            return slaHours;
        }

        public void setSlaHours(int slaHours) {
            this.slaHours = slaHours;
        }
    }

    public static class ChatResult {
        private String reply;
        private Classification classification;
        private List<Source> sources;
        private List<String> followUpQuestions;
        private boolean canCreateTicket;
        private TicketDraft ticketDraft;

        public String getReply() {
            return reply;
        }

        public void setReply(String reply) {
            this.reply = reply;
        }

        public Classification getClassification() {
            return classification;
        }

        public void setClassification(Classification classification) {
            this.classification = classification;
        }

        public List<Source> getSources() {
            return sources;
        }

        public void setSources(List<Source> sources) {
            this.sources = sources;
        }

        public List<String> getFollowUpQuestions() {
            return followUpQuestions;
        }

        public void setFollowUpQuestions(List<String> followUpQuestions) {
            this.followUpQuestions = followUpQuestions;
        }

        public boolean isCanCreateTicket() {
            return canCreateTicket;
        }

        public void setCanCreateTicket(boolean canCreateTicket) {
            this.canCreateTicket = canCreateTicket;
        }

        public TicketDraft getTicketDraft() {
            return ticketDraft;
        }

        public void setTicketDraft(TicketDraft ticketDraft) {
            this.ticketDraft = ticketDraft;
        }
    }
}
