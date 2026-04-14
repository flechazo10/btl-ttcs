package com.booking.service;

import com.booking.entity.Booking;
import com.booking.entity.Trip;
import com.booking.repository.BookingRepository;
import com.booking.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingCleanPendingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private TripRepository tripRepository;

    /**
     * Tự động quét và xử lý các đơn hàng PENDING quá hạn (15 phút)
     * Chạy mỗi 1 phút (60000ms)
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanExpiredPendingBookings() {
        // Mốc thời gian: Những đơn hàng tạo trước thời điểm này 15 phút mà vẫn PENDING
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(15);

        // 1. Tìm danh sách đơn hàng quá hạn
        List<Booking> expiredBookings = bookingRepository
                .findByStatusAndBookingTimeBefore("PENDING", cutoffTime);

        if (expiredBookings.isEmpty()) {
            return;
        }

        for (Booking booking : expiredBookings) {
            // 2. Hoàn tác số ghế đã giữ cho Chuyến xe (Trip)
            Trip trip = booking.getTrip();
            if (trip != null) {
                int restoredSeats = trip.getBookedSeats() - booking.getTotalTickets();
                trip.setBookedSeats(Math.max(0, restoredSeats));
                tripRepository.save(trip);
            }

            // 3. Xóa đơn hàng khỏi Database để làm sạch bộ nhớ
            bookingRepository.delete(booking);
            
            System.out.println("--- [HỆ THỐNG] Đã dọn dẹp đơn hàng treo quá hạn: " + booking.getId());
        }
    }
}