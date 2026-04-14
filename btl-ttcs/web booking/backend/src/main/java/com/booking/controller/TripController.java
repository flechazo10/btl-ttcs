package com.booking.controller;

import com.booking.dto.response.TripResponse;
import com.booking.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "*")
public class TripController {

    @Autowired
    private TripService tripService;

    // Lấy danh sách tất cả chuyến xe
    @GetMapping
    public List<TripResponse> getAllTrips() {
        return tripService.getAllTrips();
    }
}