package com.servicedesk.pro.controller;

import com.servicedesk.pro.dto.ApiResponse;
import com.servicedesk.pro.dto.KnowledgeBaseDto;
import com.servicedesk.pro.dto.PaginatedResponse;
import com.servicedesk.pro.model.KnowledgeBase;
import com.servicedesk.pro.model.User;
import com.servicedesk.pro.service.KnowledgeBaseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/kb")
public class KnowledgeBaseController {

    private final KnowledgeBaseService kbService;

    public KnowledgeBaseController(KnowledgeBaseService kbService) {
        this.kbService = kbService;
    }

    @GetMapping
    public ResponseEntity<?> getArticles(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit
    ) {
        PaginatedResponse<KnowledgeBase> response = kbService.getArticles(currentUser, category, search, status, page, limit);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getArticleById(@PathVariable String id) {
        try {
            KnowledgeBaseDto.ArticleDetailResponse detail = kbService.getArticleById(id);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("data", detail.getArticle());
            resp.put("related", detail.getRelated());

            return ResponseEntity.ok(resp);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Article not found"));
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('Admin', 'IT_Manager', 'Technician')")
    public ResponseEntity<?> createArticle(
            @AuthenticationPrincipal User currentUser,
            @RequestBody KnowledgeBaseDto.CreateOrUpdateArticleRequest req
    ) {
        if (req.getTitle() == null || req.getTitle().isBlank() || req.getProblemSummary() == null || req.getContent() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Title, problem summary, and content are required"));
        }

        KnowledgeBase article = kbService.createArticle(req, currentUser);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Knowledge base article created successfully.");
        resp.put("data", article);

        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Admin', 'IT_Manager', 'Technician')")
    public ResponseEntity<?> updateArticle(
            @PathVariable String id,
            @RequestBody KnowledgeBaseDto.CreateOrUpdateArticleRequest req
    ) {
        try {
            KnowledgeBase article = kbService.updateArticle(id, req);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Article updated successfully.");
            resp.put("data", article);

            return ResponseEntity.ok(resp);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Article not found"));
        }
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<?> voteArticle(
            @PathVariable String id,
            @RequestBody KnowledgeBaseDto.VoteRequest req
    ) {
        try {
            KnowledgeBase article = kbService.voteArticle(id, req.isHelpful());

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Thank you for your feedback!");
            resp.put("helpfulVotes", article.getHelpfulVotes());
            resp.put("unhelpfulVotes", article.getUnhelpfulVotes());

            return ResponseEntity.ok(resp);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Article not found"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('Admin', 'IT_Manager')")
    public ResponseEntity<?> deleteArticle(@PathVariable String id) {
        try {
            kbService.deleteArticle(id);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Article deleted successfully.");

            return ResponseEntity.ok(resp);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Article not found"));
        }
    }
}
