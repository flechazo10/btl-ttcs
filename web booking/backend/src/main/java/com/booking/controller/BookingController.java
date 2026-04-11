package com.booking.controller;

import com.booking.dto.request.BookingRequest;
import com.booking.dto.response.BookingHistoryDTO;
import com.booking.dto.response.BookingResponse;
import com.booking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // API Tạo đơn đặt vé mới
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
        try {
            BookingResponse response = bookingService.createBooking(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Nếu hết ghế hoặc lỗi, trả về HTTP 400 kèm câu thông báo lỗi
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    // Endpoint lấy lịch sử: localhost:8080/api/bookings/history/1
    @GetMapping("/history/{userId}")
    public ResponseEntity<Map<String, List<BookingHistoryDTO>>> getHistory(@PathVariable Long userId) {
        Map<String, List<BookingHistoryDTO>> history = bookingService.getBookingHistory(userId);
        return ResponseEntity.ok(history);
    }
}