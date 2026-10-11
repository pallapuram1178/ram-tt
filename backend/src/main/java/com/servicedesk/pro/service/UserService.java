package com.servicedesk.pro.service;

import com.servicedesk.pro.dto.AuthDto;
import com.servicedesk.pro.model.User;
import com.servicedesk.pro.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getUsers(String role, String department, Boolean isActive, String search) {
        String roleFilter = (role != null && !role.isBlank() && !"all".equalsIgnoreCase(role)) ? role : null;
        String deptFilter = (department != null && !department.isBlank() && !"all".equalsIgnoreCase(department)) ? department : null;
        String searchFilter = (search != null && !search.isBlank()) ? search.trim() : null;

        return userRepository.filterUsers(roleFilter, deptFilter, isActive, searchFilter);
    }

    public List<User> getTechnicians() {
        return userRepository.findByRoleInAndIsActiveTrueOrderByNameAsc(
                Arrays.asList("Technician", "IT Manager", "Admin")
        );
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmailIgnoreCase(email);
    }

    public User createUser(AuthDto.RegisterRequest req) {
        if (userRepository.existsByEmailIgnoreCase(req.getEmail())) {
            throw new IllegalArgumentException("A user with this email address already exists.");
        }

        String role = (req.getRole() != null && Arrays.asList("Admin", "IT Manager", "Technician", "Asset Manager", "Employee").contains(req.getRole()))
                ? req.getRole()
                : "Employee";

        User user = new User(
                req.getName(),
                req.getEmail().toLowerCase().trim(),
                passwordEncoder.encode(req.getPassword()),
                role,
                req.getDepartment() != null ? req.getDepartment() : "Engineering",
                req.getPhone() != null ? req.getPhone() : "",
                req.getSpecialization() != null ? req.getSpecialization() : "General Support"
        );

        return userRepository.save(user);
    }

    public User updateUser(String id, String name, String email, String role, String department, String phone, Boolean isActive, String specialization) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (name != null) user.setName(name);
        if (email != null) user.setEmail(email.toLowerCase().trim());
        if (role != null) user.setRole(role);
        if (department != null) user.setDepartment(department);
        if (phone != null) user.setPhone(phone);
        if (isActive != null) user.setActive(isActive);
        if (specialization != null) user.setSpecialization(specialization);

        return userRepository.save(user);
    }

    public User updateProfile(String userId, AuthDto.UpdateProfileRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (req.getName() != null) user.setName(req.getName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getDepartment() != null) user.setDepartment(req.getDepartment());
        if (req.getSpecialization() != null) user.setSpecialization(req.getSpecialization());

        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            if (req.getCurrentPassword() == null || req.getCurrentPassword().isBlank()) {
                throw new IllegalArgumentException("Please provide your current password.");
            }
            if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Current password does not match.");
            }
            user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        }

        return userRepository.save(user);
    }
}
