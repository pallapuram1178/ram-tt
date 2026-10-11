package com.servicedesk.pro.service;

import com.servicedesk.pro.model.Asset;
import com.servicedesk.pro.model.KnowledgeBase;
import com.servicedesk.pro.model.Ticket;
import com.servicedesk.pro.model.User;
import com.servicedesk.pro.repository.AssetRepository;
import com.servicedesk.pro.repository.KnowledgeBaseRepository;
import com.servicedesk.pro.repository.TicketRepository;
import com.servicedesk.pro.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
public class DashboardService {

    private final TicketRepository ticketRepository;
    private final AssetRepository assetRepository;
    private final KnowledgeBaseRepository kbRepository;
    private final UserRepository userRepository;

    public DashboardService(TicketRepository ticketRepository,
                            AssetRepository assetRepository,
                            KnowledgeBaseRepository kbRepository,
                            UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.assetRepository = assetRepository;
        this.kbRepository = kbRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Map<String, Object> getMetrics(User user) {
        String role = user.getRole();
        String userId = user.getId();

        // Refresh SLA status for active tickets
        List<Ticket> activeTickets = ticketRepository.findByStatusIn(Arrays.asList("Open", "In Progress", "Pending", "Reopened"));
        for (Ticket t : activeTickets) {
            t.checkAndUpdateSLA();
        }

        Map<String, Object> root = new HashMap<>();
        root.put("success", true);
        root.put("role", role);

        Map<String, Object> metrics = new HashMap<>();

        if ("Admin".equalsIgnoreCase(role) || "IT Manager".equalsIgnoreCase(role)) {
            long totalTickets = ticketRepository.count();
            long openTickets = ticketRepository.countByStatus("Open");
            long inProgressTickets = ticketRepository.countByStatus("In Progress");
            long resolvedTickets = ticketRepository.countByStatusIn(Arrays.asList("Resolved", "Closed"));
            long breachedSla = ticketRepository.countBySlaStatusAndStatusNotIn("Breached", Arrays.asList("Resolved", "Closed"));
            long atRiskSla = ticketRepository.countBySlaStatusAndStatusNotIn("At Risk", Arrays.asList("Resolved", "Closed"));
            long urgentTickets = ticketRepository.countByPriorityAndStatusNotIn("Urgent", Arrays.asList("Resolved", "Closed"));
            long unassignedCount = ticketRepository.countByAssignedToIsNullAndStatusNotIn(Arrays.asList("Resolved", "Closed"));

            int slaComplianceRate = totalTickets > 0
                    ? (int) Math.round(((double) (totalTickets - breachedSla) / totalTickets) * 100)
                    : 100;

            Map<String, Object> ticketsOverview = new HashMap<>();
            ticketsOverview.put("total", totalTickets);
            ticketsOverview.put("open", openTickets);
            ticketsOverview.put("inProgress", inProgressTickets);
            ticketsOverview.put("resolved", resolvedTickets);
            ticketsOverview.put("breachedSla", breachedSla);
            ticketsOverview.put("atRiskSla", atRiskSla);
            ticketsOverview.put("urgent", urgentTickets);
            ticketsOverview.put("unassignedCount", unassignedCount);
            ticketsOverview.put("slaComplianceRate", slaComplianceRate);
            metrics.put("tickets", ticketsOverview);

            List<Ticket> unassignedTickets = ticketRepository.findByAssignedToIsNullAndStatusNotInOrderByPriorityDescCreatedAtDesc(
                    Arrays.asList("Resolved", "Closed"),
                    PageRequest.of(0, 6)
            );
            metrics.put("unassignedTickets", unassignedTickets);

            // Category distribution: format [{ "_id": "Software", "count": 10 }]
            List<Object[]> catDistRaw = ticketRepository.getCategoryDistribution();
            List<Map<String, Object>> catDist = new ArrayList<>();
            for (Object[] r : catDistRaw) {
                Map<String, Object> item = new HashMap<>();
                item.put("_id", r[0]);
                item.put("count", r[1]);
                catDist.add(item);
            }
            metrics.put("categoryDistribution", catDist);

            // Priority distribution: format [{ "_id": "High", "count": 5 }]
            List<Object[]> prioDistRaw = ticketRepository.getPriorityDistribution();
            List<Map<String, Object>> prioDist = new ArrayList<>();
            for (Object[] r : prioDistRaw) {
                Map<String, Object> item = new HashMap<>();
                item.put("_id", r[0]);
                item.put("count", r[1]);
                prioDist.add(item);
            }
            metrics.put("priorityDistribution", prioDist);

            // Tech workload
            List<User> technicians = userRepository.findByRoleInAndIsActiveTrueOrderByNameAsc(Arrays.asList("Technician", "IT Manager"));
            List<Map<String, Object>> techWorkload = new ArrayList<>();
            for (User tech : technicians) {
                long activeCount = ticketRepository.countByAssignedTo_IdAndStatusIn(tech.getId(), Arrays.asList("In Progress", "Pending", "Reopened"));
                long resolvedCount = ticketRepository.countByAssignedTo_IdAndStatusIn(tech.getId(), Arrays.asList("Resolved", "Closed"));
                Map<String, Object> techItem = new HashMap<>();
                techItem.put("id", tech.getId());
                techItem.put("name", tech.getName());
                techItem.put("specialization", tech.getSpecialization());
                techItem.put("activeTickets", activeCount);
                techItem.put("resolvedTickets", resolvedCount);
                techWorkload.add(techItem);
            }
            metrics.put("techWorkload", techWorkload);

            // Asset overview
            long totalAssets = assetRepository.count();
            long inUseAssets = assetRepository.countByStatus("In Use");
            long inStorageAssets = assetRepository.countByStatus("In Storage");
            long underRepairAssets = assetRepository.countByStatus("Under Repair");
            Instant now = Instant.now();
            long expiringWarranties = assetRepository.countByWarrantyExpiryBetween(now, now.plus(Duration.ofDays(30)));

            Map<String, Object> assetsOverview = new HashMap<>();
            assetsOverview.put("total", totalAssets);
            assetsOverview.put("inUse", inUseAssets);
            assetsOverview.put("inStorage", inStorageAssets);
            assetsOverview.put("underRepair", underRepairAssets);
            assetsOverview.put("expiringWarranties", expiringWarranties);
            metrics.put("assets", assetsOverview);

            List<Ticket> recentTickets = ticketRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 6));
            metrics.put("recentTickets", recentTickets);

        } else if ("Technician".equalsIgnoreCase(role)) {
            long assignedToMe = ticketRepository.countByAssignedTo_IdAndStatusNotIn(userId, Arrays.asList("Resolved", "Closed"));
            long inProgressMe = ticketRepository.countByAssignedTo_IdAndStatusIn(userId, List.of("In Progress"));
            long resolvedMe = ticketRepository.countByAssignedTo_IdAndStatusIn(userId, Arrays.asList("Resolved", "Closed"));
            long urgentMe = ticketRepository.countByAssignedTo_IdAndPriorityAndStatusNotIn(userId, "Urgent", Arrays.asList("Resolved", "Closed"));
            long unassignedQueue = ticketRepository.countByAssignedToIsNullAndStatusNotIn(Arrays.asList("Resolved", "Closed"));
            long atRiskMe = ticketRepository.countByAssignedTo_IdAndSlaStatusInAndStatusNotIn(userId, Arrays.asList("At Risk", "Breached"), Arrays.asList("Resolved", "Closed"));

            metrics.put("assignedToMe", assignedToMe);
            metrics.put("inProgressMe", inProgressMe);
            metrics.put("resolvedMe", resolvedMe);
            metrics.put("urgentMe", urgentMe);
            metrics.put("unassignedQueue", unassignedQueue);
            metrics.put("atRiskMe", atRiskMe);

            List<Ticket> myActiveTickets = ticketRepository.findByAssignedTo_IdAndStatusNotInOrderBySlaDeadlineAsc(
                    userId,
                    Arrays.asList("Resolved", "Closed"),
                    PageRequest.of(0, 6)
            );
            metrics.put("myActiveTickets", myActiveTickets);

            List<Ticket> unassignedTickets = ticketRepository.findByAssignedToIsNullAndStatusOrderByPriorityDescCreatedAtDesc(
                    "Open",
                    PageRequest.of(0, 6)
            );
            metrics.put("unassignedTickets", unassignedTickets);

        } else if ("Asset Manager".equalsIgnoreCase(role)) {
            long totalAssets = assetRepository.count();
            long inUse = assetRepository.countByStatus("In Use");
            long inStorage = assetRepository.countByStatus("In Storage");
            long underRepair = assetRepository.countByStatus("Under Repair");
            long retired = assetRepository.countByStatus("Retired");
            Instant now = Instant.now();
            long expiringSoon = assetRepository.countByWarrantyExpiryBetween(now, now.plus(Duration.ofDays(60)));

            metrics.put("totalAssets", totalAssets);
            metrics.put("inUse", inUse);
            metrics.put("inStorage", inStorage);
            metrics.put("underRepair", underRepair);
            metrics.put("retired", retired);
            metrics.put("expiringSoon", expiringSoon);

            Double totalInventoryValue = assetRepository.getTotalInventoryValue();
            metrics.put("totalInventoryValue", totalInventoryValue != null ? totalInventoryValue : 0.0);

            List<Object[]> catBreakdownRaw = assetRepository.getCategoryBreakdown();
            List<Map<String, Object>> categoryBreakdown = new ArrayList<>();
            for (Object[] r : catBreakdownRaw) {
                Map<String, Object> item = new HashMap<>();
                item.put("_id", r[0]);
                item.put("count", r[1]);
                item.put("totalCost", r[2] != null ? r[2] : 0.0);
                categoryBreakdown.add(item);
            }
            metrics.put("categoryBreakdown", categoryBreakdown);

            List<Asset> recentAssets = assetRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 6));
            metrics.put("recentAssets", recentAssets);

            List<Asset> upcomingWarrantyAssets = assetRepository.findByWarrantyExpiryBetweenOrderByWarrantyExpiryAsc(
                    now,
                    now.plus(Duration.ofDays(60)),
                    PageRequest.of(0, 6)
            );
            metrics.put("upcomingWarrantyAssets", upcomingWarrantyAssets);

        } else {
            // Default: Employee view
            long myTotalTickets = ticketRepository.countByCreatedBy_Id(userId);
            long myOpenTickets = ticketRepository.countByCreatedBy_IdAndStatusIn(userId, Arrays.asList("Open", "In Progress", "Pending", "Reopened"));
            long myResolvedTickets = ticketRepository.countByCreatedBy_IdAndStatusIn(userId, Arrays.asList("Resolved", "Closed"));
            long myAssignedAssetsCount = assetRepository.countByAssignedTo_Id(userId);

            metrics.put("myTotalTickets", myTotalTickets);
            metrics.put("myOpenTickets", myOpenTickets);
            metrics.put("myResolvedTickets", myResolvedTickets);
            metrics.put("myAssignedAssetsCount", myAssignedAssetsCount);

            List<Ticket> myTickets = ticketRepository.findByCreatedBy_IdOrderByCreatedAtDesc(userId, PageRequest.of(0, 5));
            metrics.put("myTickets", myTickets);

            List<Asset> myAssets = assetRepository.findByAssignedTo_IdOrderByPurchaseDateDesc(userId);
            metrics.put("myAssets", myAssets);

            List<KnowledgeBase> recommendedArticles = kbRepository.findByStatusOrderByHelpfulVotesDesc("Approved", PageRequest.of(0, 4));
            metrics.put("recommendedArticles", recommendedArticles);
        }

        root.put("metrics", metrics);
        return root;
    }
}
