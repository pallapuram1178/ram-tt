package com.servicedesk.pro.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Value("${app.ai.provider:mock}")
    private String aiProvider;

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "online");
        resp.put("service", "ServiceDesk Pro API");
        resp.put("timestamp", Instant.now());
        resp.put("aiEngine", aiProvider);
        return ResponseEntity.ok(resp);
    }
}
