package com.booking.controller;

import com.booking.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin(origins = "*")
public class RouteController {

    @Autowired
    private RouteService routeService;

    @GetMapping
    public ResponseEntity<?> getAllRoutes() {
        try {
            return ResponseEntity.ok(routeService.getAllRoutesForAdmin());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tải danh sách tuyến đường: " + e.getMessage());
        }
    }
}