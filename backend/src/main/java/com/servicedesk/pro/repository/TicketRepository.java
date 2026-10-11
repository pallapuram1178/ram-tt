package com.servicedesk.pro.repository;

import com.servicedesk.pro.model.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String>, JpaSpecificationExecutor<Ticket> {

    Optional<Ticket> findByTicketId(String ticketId);

    List<Ticket> findByStatusIn(List<String> statuses);

    long countByStatus(String status);

    long countByStatusIn(List<String> statuses);

    long countByStatusNotIn(List<String> statuses);

    long countBySlaStatusAndStatusNotIn(String slaStatus, List<String> statuses);

    long countByPriorityAndStatusNotIn(String priority, List<String> statuses);

    long countByAssignedToIsNullAndStatusNotIn(List<String> statuses);

    long countByAssignedTo_IdAndStatusIn(String technicianId, List<String> statuses);

    long countByAssignedTo_IdAndStatusNotIn(String technicianId, List<String> statuses);

    long countByAssignedTo_IdAndPriorityAndStatusNotIn(String technicianId, String priority, List<String> statuses);

    long countByAssignedTo_IdAndSlaStatusInAndStatusNotIn(String technicianId, List<String> slaStatuses, List<String> statuses);

    long countByCreatedBy_Id(String userId);

    long countByCreatedBy_IdAndStatusIn(String userId, List<String> statuses);

    List<Ticket> findByAssignedToIsNullAndStatusNotInOrderByPriorityDescCreatedAtDesc(List<String> statuses, Pageable pageable);

    List<Ticket> findByAssignedToIsNullAndStatusOrderByPriorityDescCreatedAtDesc(String status, Pageable pageable);

    List<Ticket> findByAssignedTo_IdAndStatusNotInOrderBySlaDeadlineAsc(String technicianId, List<String> statuses, Pageable pageable);

    List<Ticket> findByCreatedBy_IdOrderByCreatedAtDesc(String userId, Pageable pageable);

    List<Ticket> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT t.category as category, COUNT(t) as count FROM Ticket t GROUP BY t.category ORDER BY count DESC")
    List<Object[]> getCategoryDistribution();

    @Query("SELECT t.priority as priority, COUNT(t) as count FROM Ticket t GROUP BY t.priority")
    List<Object[]> getPriorityDistribution();

    @Query("SELECT MAX(t.ticketId) FROM Ticket t WHERE t.ticketId LIKE 'TICK-%'")
    String findMaxTicketId();
}
