package com.servicedesk.pro.service;

import com.servicedesk.pro.dto.KnowledgeBaseDto;
import com.servicedesk.pro.dto.PaginatedResponse;
import com.servicedesk.pro.model.KnowledgeBase;
import com.servicedesk.pro.model.User;
import com.servicedesk.pro.repository.KnowledgeBaseRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class KnowledgeBaseService {

    private final KnowledgeBaseRepository kbRepository;

    public KnowledgeBaseService(KnowledgeBaseRepository kbRepository) {
        this.kbRepository = kbRepository;
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<KnowledgeBase> getArticles(
            User currentUser,
            String category,
            String search,
            String status,
            int page,
            int limit
    ) {
        int pageIndex = Math.max(0, page - 1);
        int pageSize = limit > 0 ? limit : 20;

        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.DESC, "helpfulVotes", "createdAt"));

        boolean canSeeAllStatuses = currentUser != null && Arrays.asList("Admin", "IT Manager").contains(currentUser.getRole());

        Specification<KnowledgeBase> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (!canSeeAllStatuses) {
                predicates.add(cb.equal(root.get("status"), "Approved"));
            } else if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate searchPred = cb.or(
                        cb.like(cb.lower(root.get("articleId")), searchPattern),
                        cb.like(cb.lower(root.get("title")), searchPattern),
                        cb.like(cb.lower(root.get("problemSummary")), searchPattern),
                        cb.like(cb.lower(root.get("content")), searchPattern)
                );
                predicates.add(searchPred);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<KnowledgeBase> pageResult = kbRepository.findAll(spec, pageable);

        // Category counts aggregation for UI badges
        List<Object[]> categoryCountsRaw = kbRepository.getApprovedCategoryCounts();
        List<Map<String, Object>> categoryCounts = new ArrayList<>();
        for (Object[] row : categoryCountsRaw) {
            Map<String, Object> map = new HashMap<>();
            map.put("_id", row[0]);
            map.put("count", row[1]);
            categoryCounts.add(map);
        }

        PaginatedResponse<KnowledgeBase> response = new PaginatedResponse<>(
                pageResult.getNumberOfElements(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                page,
                pageResult.getContent()
        );
        response.setCategoryCounts(categoryCounts);

        return response;
    }

    private KnowledgeBase findArticle(String id) {
        if (id.startsWith("KB-")) {
            return kbRepository.findByArticleId(id)
                    .orElseThrow(() -> new NoSuchElementException("Article not found"));
        }
        return kbRepository.findById(id)
                .orElseGet(() -> kbRepository.findByArticleId(id)
                        .orElseThrow(() -> new NoSuchElementException("Article not found")));
    }

    @Transactional
    public KnowledgeBaseDto.ArticleDetailResponse getArticleById(String id) {
        KnowledgeBase article = findArticle(id);

        article.setViews(article.getViews() + 1);
        kbRepository.save(article);

        List<KnowledgeBase> related = kbRepository.findByIdNotAndCategoryAndStatus(
                article.getId(),
                article.getCategory(),
                "Approved",
                PageRequest.of(0, 3)
        );

        return new KnowledgeBaseDto.ArticleDetailResponse(article, related);
    }

    @Transactional
    public synchronized KnowledgeBase createArticle(KnowledgeBaseDto.CreateOrUpdateArticleRequest req, User currentUser) {
        String nextId = generateNextArticleId();

        KnowledgeBase article = new KnowledgeBase();
        article.setArticleId(nextId);
        article.setTitle(req.getTitle());
        article.setCategory(req.getCategory() != null ? req.getCategory() : "General IT");
        article.setTags(req.getTags() != null ? new ArrayList<>(req.getTags()) : new ArrayList<>());
        article.setProblemSummary(req.getProblemSummary());
        article.setSymptoms(req.getSymptoms() != null ? new ArrayList<>(req.getSymptoms()) : new ArrayList<>());
        article.setStepByStepSolution(req.getStepByStepSolution() != null ? new ArrayList<>(req.getStepByStepSolution()) : new ArrayList<>());
        article.setContent(req.getContent());
        article.setStatus(req.getStatus() != null ? req.getStatus() : "Approved");
        article.setAuthor(currentUser);

        return kbRepository.save(article);
    }

    @Transactional
    public KnowledgeBase updateArticle(String id, KnowledgeBaseDto.CreateOrUpdateArticleRequest req) {
        KnowledgeBase article = findArticle(id);

        if (req.getTitle() != null) article.setTitle(req.getTitle());
        if (req.getCategory() != null) article.setCategory(req.getCategory());
        if (req.getTags() != null) article.setTags(new ArrayList<>(req.getTags()));
        if (req.getProblemSummary() != null) article.setProblemSummary(req.getProblemSummary());
        if (req.getSymptoms() != null) article.setSymptoms(new ArrayList<>(req.getSymptoms()));
        if (req.getStepByStepSolution() != null) article.setStepByStepSolution(new ArrayList<>(req.getStepByStepSolution()));
        if (req.getContent() != null) article.setContent(req.getContent());
        if (req.getStatus() != null) article.setStatus(req.getStatus());

        return kbRepository.save(article);
    }

    @Transactional
    public KnowledgeBase voteArticle(String id, boolean helpful) {
        KnowledgeBase article = findArticle(id);

        if (helpful) {
            article.setHelpfulVotes(article.getHelpfulVotes() + 1);
        } else {
            article.setUnhelpfulVotes(article.getUnhelpfulVotes() + 1);
        }

        return kbRepository.save(article);
    }

    @Transactional
    public void deleteArticle(String id) {
        KnowledgeBase article = findArticle(id);
        kbRepository.delete(article);
    }

    private synchronized String generateNextArticleId() {
        String maxId = kbRepository.findMaxArticleId();
        int nextNum = 201;
        if (maxId != null && maxId.startsWith("KB-")) {
            try {
                int current = Integer.parseInt(maxId.substring(3));
                nextNum = current + 1;
            } catch (NumberFormatException ignored) {}
        }
        return "KB-" + nextNum;
    }
}
