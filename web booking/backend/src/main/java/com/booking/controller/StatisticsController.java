package com.booking.controller;

import com.booking.dto.response.StatisticsDTO;
import com.booking.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Year;

@RestController
@RequestMapping("/api/admin/statistics")
@CrossOrigin(origins = "*")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    /**
     * API lấy toàn bộ dữ liệu thống kê cho Dashboard.
     * GET /api/admin/statistics?year=2026
     * Nếu không truyền year, mặc định là năm hiện tại.
     */
    @GetMapping
    public ResponseEntity<StatisticsDTO> getStatistics(
            @RequestParam(value = "year", required = false) Integer year) {
        
        if (year == null) {
            year = Year.now().getValue(); // Mặc định lấy năm hiện tại
        }

        StatisticsDTO stats = statisticsService.getStatistics(year);
        return ResponseEntity.ok(stats);
    }
}
