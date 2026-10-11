package com.servicedesk.pro.controller;

import com.servicedesk.pro.config.JwtUtils;
import com.servicedesk.pro.dto.ApiResponse;
import com.servicedesk.pro.dto.AuthDto;
import com.servicedesk.pro.model.User;
import com.servicedesk.pro.repository.UserRepository;
import com.servicedesk.pro.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthController(UserService userService,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtils jwtUtils) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthDto.RegisterRequest req) {
        try {
            User user = userService.createUser(req);
            String token = jwtUtils.generateToken(user.getId(), user.getEmail(), user.getRole());

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("token", token);
            resp.put("user", new AuthDto.UserSummary(user));

            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDto.LoginRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Please provide both email and password."));
        }

        User user = userService.getUserByEmail(req.getEmail().trim()).orElse(null);

        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Invalid email or password."));
        }

        if (!user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Account has been deactivated. Please contact IT Administrator."));
        }

        String token = jwtUtils.generateToken(user.getId(), user.getEmail(), user.getRole());

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("token", token);
        resp.put("user", new AuthDto.UserSummary(user));

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("user", new AuthDto.UserSummary(currentUser));

        return ResponseEntity.ok(resp);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody AuthDto.UpdateProfileRequest req
    ) {
        try {
            User updated = userService.updateProfile(currentUser.getId(), req);

            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "Profile updated successfully.");
            resp.put("user", new AuthDto.UserSummary(updated));

            return ResponseEntity.ok(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
