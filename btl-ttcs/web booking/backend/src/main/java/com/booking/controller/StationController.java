package com.booking.controller;

import com.booking.dto.response.StationResponse;
import com.booking.service.StationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@CrossOrigin(origins = "*")
public class StationController {

    @Autowired
    private StationService stationService;

    // Lấy danh sách tất cả bến xe/điểm đón
    @GetMapping
    public List<StationResponse> getAllStations() {
        return stationService.getAllStations();
    }
}