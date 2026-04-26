package com.booking.controller;

import com.booking.service.BusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/buses")
@CrossOrigin(origins = "*")
public class BusController {

    @Autowired
    private BusService busService;

    @GetMapping
    public ResponseEntity<?> getAllBuses() {
        try {
            return ResponseEntity.ok(busService.getAllActiveBusesForAdmin());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tải danh sách xe: " + e.getMessage());
        }
    }
}