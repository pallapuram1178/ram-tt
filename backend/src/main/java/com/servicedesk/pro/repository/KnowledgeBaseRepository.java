package com.servicedesk.pro.repository;

import com.servicedesk.pro.model.KnowledgeBase;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KnowledgeBaseRepository extends JpaRepository<KnowledgeBase, String>, JpaSpecificationExecutor<KnowledgeBase> {

    Optional<KnowledgeBase> findByArticleId(String articleId);

    List<KnowledgeBase> findByStatus(String status);

    List<KnowledgeBase> findByStatusOrderByHelpfulVotesDesc(String status, Pageable pageable);

    List<KnowledgeBase> findByIdNotAndCategoryAndStatus(String id, String category, String status, Pageable pageable);

    @Query("SELECT k.category, COUNT(k) FROM KnowledgeBase k WHERE k.status = 'Approved' GROUP BY k.category")
    List<Object[]> getApprovedCategoryCounts();

    @Query("SELECT MAX(k.articleId) FROM KnowledgeBase k WHERE k.articleId LIKE 'KB-%'")
    String findMaxArticleId();
}
