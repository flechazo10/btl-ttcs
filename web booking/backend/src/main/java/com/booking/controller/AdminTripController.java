package com.booking.controller;

import com.booking.entity.Trip;
import com.booking.service.TripService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/trips")
@CrossOrigin(origins = "*") 
public class AdminTripController {

    @Autowired
    private TripService tripService;

    // 1. API TẠO CHUYẾN MỚI
    @PostMapping("/createtrip")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createTrip(@RequestBody Trip tripRequest) {
        try {
            Trip newTrip = tripService.createTrip(tripRequest);
            return ResponseEntity.ok(Map.of("message", "Tạo chuyến xe thành công!", "tripId", newTrip.getId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 2. API NHÂN BẢN NHIỀU NGÀY
    @SuppressWarnings("unchecked") 
    @PostMapping("/clone-bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cloneBulkTrips(@RequestBody Map<String, Object> request) {
        try {
            LocalDate sourceDate = LocalDate.parse(request.get("sourceDate").toString());
            List<String> dateStrings = (List<String>) request.get("targetDates");
            
            List<LocalDate> targetDates = dateStrings.stream()
                                                     .map(LocalDate::parse)
                                                     .collect(Collectors.toList());

            tripService.cloneTripsForDates(sourceDate, targetDates);
            return ResponseEntity.ok(Map.of("message", "Đã nhân bản thành công sang " + targetDates.size() + " ngày mới!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 3. API HỦY 1 CHUYẾN THEO ID
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> cancelTrip(@PathVariable("id") Long tripId) {
        try {
            tripService.cancelTripById(tripId);
            return ResponseEntity.ok(Map.of("message", "Đã hủy chuyến xe số " + tripId + " thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    // 4. API Lấy danh sách chuyến xe theo Ngày (Truyền 01/01/2026 sẽ ra chuyến mẫu)
    @GetMapping("/by-date")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTripsByDate(@RequestParam("date") String dateString) {
        try {
            LocalDate date = LocalDate.parse(dateString);
            return ResponseEntity.ok(tripService.getTripsByDateForAdmin(date));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 5. API Xóa vĩnh viễn chuyến mẫu (Dùng HTTP DELETE)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTemplateTrip(@PathVariable("id") Long tripId) {
        try {
            tripService.deleteTemplateTrip(tripId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa vĩnh viễn chuyến xe mẫu!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 6. API Lấy danh sách Hành khách cho Modal
    @GetMapping("/{id}/passengers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getTripPassengers(@PathVariable("id") Long tripId) {
        try {
            return ResponseEntity.ok(tripService.getPassengersByTripId(tripId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}