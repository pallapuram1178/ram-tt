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
public class HealthController {

    @Value("${app.ai.provider:mock}")
    private String aiProvider;

    @GetMapping({"/", "/api/health"})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", "online");
        resp.put("service", "ServiceDesk Pro API");
        resp.put("timestamp", Instant.now().toString());
        resp.put("aiEngine", aiProvider);
        resp.put("message", "ServiceDesk Pro Spring Boot Backend is running smoothly.");
        return ResponseEntity.ok(resp);
    }
}
