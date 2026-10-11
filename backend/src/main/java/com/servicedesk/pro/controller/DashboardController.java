package com.servicedesk.pro.controller;

import com.servicedesk.pro.model.User;
import com.servicedesk.pro.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<?> getDashboardMetrics(@AuthenticationPrincipal User currentUser) {
        Map<String, Object> metrics = dashboardService.getMetrics(currentUser);
        return ResponseEntity.ok(metrics);
    }
}
