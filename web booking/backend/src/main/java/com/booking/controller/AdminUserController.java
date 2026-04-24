package com.booking.controller;

import com.booking.dto.response.UserResponse;
import com.booking.entity.User;
import com.booking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users") // 🌟 Đổi gốc thành /users cho chuẩn chỉnh
@CrossOrigin(origins = "*")
public class AdminUserController {

    @Autowired
    private UserService userService;

    // 1. API Lấy danh sách toàn bộ User
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.findAllUsers();
            List<UserResponse> responses = users.stream()
                .map(u -> new UserResponse(
                    u.getId(), u.getUsername(), u.getFullName(), 
                    u.getEmail(), u.getPhone(), u.getRole(), u.getStatus()
                )).collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. API Khóa/Mở khóa User
    @PutMapping("/{id}/ban")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleUser(@PathVariable("id") Long userId) {
        try {
            String newStatus = userService.toggleUserStatus(userId);
            return ResponseEntity.ok(Map.of("message", "Trạng thái mới: " + newStatus));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}