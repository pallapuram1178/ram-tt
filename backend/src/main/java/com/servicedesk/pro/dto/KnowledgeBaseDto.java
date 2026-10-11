package com.servicedesk.pro.dto;

import com.servicedesk.pro.model.KnowledgeBase;
import java.util.List;

public class KnowledgeBaseDto {

    public static class CreateOrUpdateArticleRequest {
        private String title;
        private String category = "General IT";
        private List<String> tags;
        private String problemSummary;
        private List<String> symptoms;
        private List<String> stepByStepSolution;
        private String content;
        private String status = "Approved";

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
    }

    public static class VoteRequest {
        private boolean helpful;

        public boolean isHelpful() {
            return helpful;
        }

        public void setHelpful(boolean helpful) {
            this.helpful = helpful;
        }
    }

    public static class ArticleDetailResponse {
        private KnowledgeBase article;
        private List<KnowledgeBase> related;

        public ArticleDetailResponse() {}

        public ArticleDetailResponse(KnowledgeBase article, List<KnowledgeBase> related) {
            this.article = article;
            this.related = related;
        }

        public KnowledgeBase getArticle() {
            return article;
        }

        public void setArticle(KnowledgeBase article) {
            this.article = article;
        }

        public List<KnowledgeBase> getRelated() {
            return related;
        }

        public void setRelated(List<KnowledgeBase> related) {
            this.related = related;
        }
    }
}
