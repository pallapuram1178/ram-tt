package com.servicedesk.pro.service;

import com.servicedesk.pro.dto.AssetDto;
import com.servicedesk.pro.dto.PaginatedResponse;
import com.servicedesk.pro.model.Asset;
import com.servicedesk.pro.model.AssetSpecifications;
import com.servicedesk.pro.model.RepairRecord;
import com.servicedesk.pro.model.User;
import com.servicedesk.pro.repository.AssetRepository;
import com.servicedesk.pro.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    public AssetService(AssetRepository assetRepository, UserRepository userRepository) {
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public PaginatedResponse<Asset> getAssets(
            User currentUser,
            String category,
            String status,
            String assignedDepartment,
            String assignedTo,
            String warrantyStatus,
            String search,
            int page,
            int limit,
            String sortBy,
            String sortOrder
    ) {
        int pageIndex = Math.max(0, page - 1);
        int pageSize = limit > 0 ? limit : 20;

        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortProperty = (sortBy != null && !sortBy.isBlank()) ? sortBy : "createdAt";
        if ("id".equalsIgnoreCase(sortProperty)) sortProperty = "createdAt";

        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(direction, sortProperty));

        Specification<Asset> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if ("Employee".equalsIgnoreCase(currentUser.getRole())) {
                predicates.add(cb.equal(root.get("assignedTo").get("id"), currentUser.getId()));
            } else if (assignedTo != null && !assignedTo.isBlank() && !"all".equalsIgnoreCase(assignedTo)) {
                if ("unassigned".equalsIgnoreCase(assignedTo)) {
                    predicates.add(cb.isNull(root.get("assignedTo")));
                } else {
                    predicates.add(cb.equal(root.get("assignedTo").get("id"), assignedTo));
                }
            }

            if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (assignedDepartment != null && !assignedDepartment.isBlank() && !"all".equalsIgnoreCase(assignedDepartment)) {
                predicates.add(cb.equal(root.get("assignedDepartment"), assignedDepartment));
            }

            Instant now = Instant.now();
            Instant thirtyDaysAhead = now.plus(Duration.ofDays(30));

            if ("expired".equalsIgnoreCase(warrantyStatus)) {
                predicates.add(cb.lessThan(root.get("warrantyExpiry"), now));
            } else if ("expiring-soon".equalsIgnoreCase(warrantyStatus)) {
                predicates.add(cb.between(root.get("warrantyExpiry"), now, thirtyDaysAhead));
            } else if ("active".equalsIgnoreCase(warrantyStatus)) {
                predicates.add(cb.greaterThan(root.get("warrantyExpiry"), now));
            }

            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.trim().toLowerCase() + "%";
                Predicate searchPred = cb.or(
                        cb.like(cb.lower(root.get("assetTag")), searchPattern),
                        cb.like(cb.lower(root.get("name")), searchPattern),
                        cb.like(cb.lower(root.get("model")), searchPattern),
                        cb.like(cb.lower(root.get("serialNumber")), searchPattern),
                        cb.like(cb.lower(root.get("vendor")), searchPattern)
                );
                predicates.add(searchPred);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Asset> pageResult = assetRepository.findAll(spec, pageable);

        return new PaginatedResponse<>(
                pageResult.getNumberOfElements(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                page,
                pageResult.getContent()
        );
    }

    private Asset findAsset(String id) {
        if (id.startsWith("AST-")) {
            return assetRepository.findByAssetTag(id)
                    .orElseThrow(() -> new NoSuchElementException("Asset not found"));
        }
        return assetRepository.findById(id)
                .orElseGet(() -> assetRepository.findByAssetTag(id)
                        .orElseThrow(() -> new NoSuchElementException("Asset not found")));
    }

    @Transactional(readOnly = true)
    public Asset getAssetById(String id, User currentUser) {
        return findAsset(id);
    }

    @Transactional
    public synchronized Asset createAsset(AssetDto.CreateOrUpdateAssetRequest req) {
        String nextTag = generateNextAssetTag();

        User assignedUser = null;
        if (req.getAssignedTo() != null && !req.getAssignedTo().isBlank()) {
            assignedUser = userRepository.findById(req.getAssignedTo()).orElse(null);
        }

        Asset asset = new Asset();
        asset.setAssetTag(nextTag);
        asset.setName(req.getName());
        asset.setCategory(req.getCategory() != null ? req.getCategory() : "Laptop");
        asset.setModel(req.getModel());
        asset.setSerialNumber(req.getSerialNumber());
        asset.setVendor(req.getVendor() != null ? req.getVendor() : "Apple / Dell / Lenovo / Microsoft");
        asset.setStatus(assignedUser != null ? "In Use" : (req.getStatus() != null ? req.getStatus() : "In Storage"));
        asset.setAssignedTo(assignedUser);
        asset.setAssignedDepartment(req.getAssignedDepartment() != null ? req.getAssignedDepartment() : "IT Support");
        asset.setPurchaseDate(req.getPurchaseDate() != null ? req.getPurchaseDate() : Instant.now());
        asset.setPurchaseCost(req.getPurchaseCost() != null ? req.getPurchaseCost() : 0.0);
        asset.setWarrantyExpiry(req.getWarrantyExpiry() != null ? req.getWarrantyExpiry() : Instant.now().plus(Duration.ofDays(365)));
        asset.setLocation(req.getLocation() != null ? req.getLocation() : "Main Office - Building A");
        asset.setSpecifications(req.getSpecifications() != null ? req.getSpecifications() : new AssetSpecifications());
        asset.setNotes(req.getNotes() != null ? req.getNotes() : "");

        return assetRepository.save(asset);
    }

    @Transactional
    public Asset updateAsset(String id, AssetDto.CreateOrUpdateAssetRequest req) {
        Asset asset = findAsset(id);

        if (req.getName() != null) asset.setName(req.getName());
        if (req.getCategory() != null) asset.setCategory(req.getCategory());
        if (req.getModel() != null) asset.setModel(req.getModel());
        if (req.getSerialNumber() != null) asset.setSerialNumber(req.getSerialNumber());
        if (req.getVendor() != null) asset.setVendor(req.getVendor());
        if (req.getStatus() != null) asset.setStatus(req.getStatus());

        if (req.getAssignedTo() != null) {
            if (req.getAssignedTo().isBlank()) {
                asset.setAssignedTo(null);
            } else {
                User user = userRepository.findById(req.getAssignedTo()).orElse(null);
                asset.setAssignedTo(user);
                if (user != null && "In Storage".equalsIgnoreCase(asset.getStatus())) {
                    asset.setStatus("In Use");
                }
            }
        }

        if (req.getAssignedDepartment() != null) asset.setAssignedDepartment(req.getAssignedDepartment());
        if (req.getPurchaseDate() != null) asset.setPurchaseDate(req.getPurchaseDate());
        if (req.getPurchaseCost() != null) asset.setPurchaseCost(req.getPurchaseCost());
        if (req.getWarrantyExpiry() != null) asset.setWarrantyExpiry(req.getWarrantyExpiry());
        if (req.getLocation() != null) asset.setLocation(req.getLocation());
        if (req.getSpecifications() != null) asset.setSpecifications(req.getSpecifications());
        if (req.getNotes() != null) asset.setNotes(req.getNotes());

        return assetRepository.save(asset);
    }

    @Transactional
    public List<RepairRecord> addRepairRecord(String id, AssetDto.AddRepairRequest req, User currentUser) {
        Asset asset = findAsset(id);

        RepairRecord record = new RepairRecord(
                req.getIssue(),
                req.getCost() != null ? req.getCost() : 0.0,
                req.getPerformedBy() != null ? req.getPerformedBy() : currentUser.getName(),
                req.getStatus() != null ? req.getStatus() : "Completed",
                req.getNotes() != null ? req.getNotes() : "",
                req.getDate() != null ? req.getDate() : Instant.now()
        );

        asset.getRepairHistory().add(record);

        if ("In Progress".equalsIgnoreCase(record.getStatus()) || "Scheduled".equalsIgnoreCase(record.getStatus())) {
            asset.setStatus("Under Repair");
        }

        assetRepository.save(asset);
        return asset.getRepairHistory();
    }

    @Transactional
    public void deleteAsset(String id) {
        Asset asset = findAsset(id);
        assetRepository.delete(asset);
    }

    private synchronized String generateNextAssetTag() {
        String maxTag = assetRepository.findMaxAssetTag();
        int nextNum = 101;
        if (maxTag != null && maxTag.startsWith("AST-")) {
            try {
                int current = Integer.parseInt(maxTag.substring(4));
                nextNum = current + 1;
            } catch (NumberFormatException ignored) {}
        }
        return "AST-" + nextNum;
    }
}
