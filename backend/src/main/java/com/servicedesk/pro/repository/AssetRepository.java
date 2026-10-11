package com.servicedesk.pro.repository;

import com.servicedesk.pro.model.Asset;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssetRepository extends JpaRepository<Asset, String>, JpaSpecificationExecutor<Asset> {

    Optional<Asset> findByAssetTag(String assetTag);

    long countByStatus(String status);

    long countByAssignedTo_Id(String userId);

    long countByWarrantyExpiryBetween(Instant start, Instant end);

    List<Asset> findByAssignedTo_IdOrderByPurchaseDateDesc(String userId);

    List<Asset> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<Asset> findByWarrantyExpiryBetweenOrderByWarrantyExpiryAsc(Instant start, Instant end, Pageable pageable);

    @Query("SELECT a.category as category, COUNT(a) as count, SUM(a.purchaseCost) as totalCost FROM Asset a GROUP BY a.category")
    List<Object[]> getCategoryBreakdown();

    @Query("SELECT SUM(a.purchaseCost) FROM Asset a")
    Double getTotalInventoryValue();

    @Query("SELECT MAX(a.assetTag) FROM Asset a WHERE a.assetTag LIKE 'AST-%'")
    String findMaxAssetTag();
}
