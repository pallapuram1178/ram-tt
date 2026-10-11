package com.servicedesk.pro.controller;

import com.servicedesk.pro.dto.ApiResponse;
import com.servicedesk.pro.model.User;
import com.servicedesk.pro.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String search
    ) {
        List<User> users = userService.getUsers(role, department, isActive, search);

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("count", users.size());
        resp.put("data", users);

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/technicians")
    public ResponseEntity<?> getTechnicians() {
        List<User> technicians = userService.getTechnicians();

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("data", technicians);

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(user -> ResponseEntity.ok(ApiResponse.success(user)))
                .orElseGet(() -> ResponseEntity.status(404).body(ApiResponse.error("User not found")));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> updateUser(
            @PathVariable String id,
            @RequestBody Map<String, Object> body
    ) {
        try {
            String name = (String) body.get("name");
            String email = (String) body.get("email");
            String role = (String) body.get("role");
            String department = (String) body.get("department");
            String phone = (String) body.get("phone");
            Boolean isActive = body.containsKey("isActive") ? (Boolean) body.get("isActive") : null;
            String specialization = (String) body.get("specialization");

            User updated = userService.updateUser(id, name, email, role, department, phone, isActive, specialization);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "User updated successfully");
            resp.put("data", updated);

            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(ApiResponse.error(e.getMessage()));
        }
    }
}
