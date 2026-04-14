package com.booking.repository;

import com.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    // Tìm tất cả đơn hàng PAID của User, sắp xếp cái mới nhất lên đầu
    List<Booking> findByUserIdAndStatusOrderByBookingTimeDesc(Long userId, String status);
    List<Booking> findByStatusAndBookingTimeBefore(String status, LocalDateTime time);
}