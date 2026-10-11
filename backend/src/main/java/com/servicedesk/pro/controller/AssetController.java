package com.servicedesk.pro.controller;

import com.servicedesk.pro.dto.ApiResponse;
import com.servicedesk.pro.dto.AssetDto;
import com.servicedesk.pro.dto.PaginatedResponse;
import com.servicedesk.pro.model.Asset;
import com.servicedesk.pro.model.RepairRecord;
import com.servicedesk.pro.model.User;
import com.servicedesk.pro.service.AssetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping
    public ResponseEntity<?> getAssets(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assignedDepartment,
            @RequestParam(required = false) String assignedTo,
            @RequestParam(required = false) String warrantyStatus,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder
    ) {
        PaginatedResponse<Asset> response = assetService.getAssets(
                currentUser, category, status, assignedDepartment, assignedTo, warrantyStatus, search, page, limit, sortBy, sortOrder
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAssetById(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser
    ) {
        try {
            Asset asset = assetService.getAssetById(id, currentUser);
            return ResponseEntity.ok(ApiResponse.success(asset));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Asset not found"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('Admin', 'IT_Manager', 'Asset_Manager')")
    public ResponseEntity<?> createAsset(
            @RequestBody AssetDto.CreateOrUpdateAssetRequest req
    ) {
        if (req.getName() == null || req.getName().isBlank() || req.getModel() == null || req.getModel().isBlank() || req.getSerialNumber() == null || req.getSerialNumber().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Name, model, and serial number are required"));
        }

        Asset created = assetService.createAsset(req);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "Asset registered successfully.");
        resp.put("data", created);

        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('Admin', 'IT_Manager', 'Asset_Manager')")
    public ResponseEntity<?> updateAsset(
            @PathVariable String id,
            @RequestBody AssetDto.CreateOrUpdateAssetRequest req
    ) {
        try {
            Asset updated = assetService.updateAsset(id, req);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Asset updated successfully.");
            resp.put("data", updated);

            return ResponseEntity.ok(resp);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Asset not found"));
        }
    }

    @PostMapping("/{id}/repairs")
    @PreAuthorize("hasAnyRole('Admin', 'IT_Manager', 'Asset_Manager', 'Technician')")
    public ResponseEntity<?> addRepairRecord(
            @PathVariable String id,
            @AuthenticationPrincipal User currentUser,
            @RequestBody AssetDto.AddRepairRequest req
    ) {
        if (req.getIssue() == null || req.getIssue().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Issue description is required"));
        }

        try {
            List<RepairRecord> records = assetService.addRepairRecord(id, req, currentUser);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Repair record added successfully.");
            resp.put("data", records);

            return ResponseEntity.ok(resp);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Asset not found"));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('Admin', 'Asset_Manager')")
    public ResponseEntity<?> deleteAsset(@PathVariable String id) {
        try {
            assetService.deleteAsset(id);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Asset removed successfully.");

            return ResponseEntity.ok(resp);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Asset not found"));
        }
    }
}
