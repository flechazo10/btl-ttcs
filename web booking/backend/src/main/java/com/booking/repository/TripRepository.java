package com.booking.repository;

import com.booking.entity.Route;
import com.booking.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    
    // Hàm cũ của bạn (Giữ nguyên để dùng cho các logic khác)
    Optional<Trip> findByRouteAndDepartureTimeAndStatus(Route route, LocalDateTime departureTime, String status);

    // 🌟 THÊM MỚI: Lấy danh sách toàn bộ chuyến xe trong 1 ngày cụ thể
    List<Trip> findByDepartureTimeBetweenAndStatus(LocalDateTime startOfDay, LocalDateTime endOfDay, String status);
}