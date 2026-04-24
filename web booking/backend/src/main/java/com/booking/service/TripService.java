package com.booking.service;

import com.booking.dto.response.TripResponse;
import com.booking.entity.Booking;
import com.booking.entity.Bus;
import com.booking.entity.Route;
import com.booking.entity.Trip;
import com.booking.repository.BookingRepository;
import com.booking.repository.BusRepository;
import com.booking.repository.RouteRepository;
import com.booking.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;
    
    // Khai báo thêm các Repository cần thiết cho các hàm của Admin
    @Autowired
    private RouteRepository routeRepository;
    @Autowired
    private BusRepository busRepository;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private EmailService emailService;

    // ========================================================
    // PHẦN 1: CÁC HÀM DÀNH CHO KHÁCH HÀNG (PUBLIC)
    // ========================================================

    public List<TripResponse> getAllTrips() {
        List<Trip> trips = tripRepository.findAll();
        return trips.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    private TripResponse convertToResponse(Trip trip) {
        TripResponse response = new TripResponse();
        response.setId(trip.getId());
        response.setDepartureTime(trip.getDepartureTime());
        response.setArrivalTime(trip.getArrivalTime());
        
        response.setStatus(trip.getStatus());

        if (trip.getPrice() != null) {
            response.setPrice(trip.getPrice().doubleValue());
        }

        if (trip.getRoute() != null) {
        
        // 1. Lấy thông tin NƠI XUẤT PHÁT
        if (trip.getRoute().getStartStation() != null) {
            // Lấy tên Bến xe đi
            response.setStartStationName(trip.getRoute().getStartStation().getName());
            
            // Lấy luôn tên Tỉnh đi (từ Bến xe)
            if (trip.getRoute().getStartStation().getProvince() != null) {
                response.setStartProvinceName(trip.getRoute().getStartStation().getProvince().getName());
            }
        }

        // 2. Lấy thông tin NƠI ĐẾN
        if (trip.getRoute().getEndStation() != null) {
            // Lấy tên Bến xe đến
            response.setEndStationName(trip.getRoute().getEndStation().getName());
            
            // Lấy luôn tên Tỉnh đến (từ Bến xe)
            if (trip.getRoute().getEndStation().getProvince() != null) {
                response.setEndProvinceName(trip.getRoute().getEndStation().getProvince().getName());
            }
        }
    }
        
        int total = 0;
        if (trip.getBus() != null) {
            response.setLicensePlate(trip.getBus().getLicensePlate());
            if (trip.getBus().getBusType() != null) {
                response.setBusTypeName(trip.getBus().getBusType().getName());
                total = trip.getBus().getBusType().getTotalSeats();
            }
        }
        
        int booked = (trip.getBookedSeats() != null) ? trip.getBookedSeats() : 0;
        response.setTotalSeats(total);
        response.setBookedSeats(booked);
        response.setAvailableSeats(total - booked); 
        
        return response;
    }

    // ========================================================
    // PHẦN 2: CÁC HÀM DÀNH CHO ADMIN (BẢO MẬT BẰNG @PreAuthorize)
    // ========================================================

    @PreAuthorize("hasRole('ADMIN')")
    public Trip createTrip(Trip tripRequest) {
        if (tripRequest.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Lỗi: Không thể tạo chuyến xe ở trong quá khứ!");
        }
        
        Route route = routeRepository.findById(tripRequest.getRoute().getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Tuyến đường!"));
        Bus bus = busRepository.findById(tripRequest.getBus().getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Xe!"));

        tripRequest.setRoute(route);
        tripRequest.setBus(bus);
        tripRequest.setStatus("ACTIVE");
        tripRequest.setBookedSeats(0);

        return tripRepository.save(tripRequest);
    }

    // 🌟 SỬA HÀM NHÂN BẢN: Lấy TẤT CẢ chuyến xe của Ngày mẫu -> Copy ra Nhiều ngày mới
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void cloneTripsForDates(LocalDate sourceDate, List<LocalDate> targetDates) {
        // 1. Tìm toàn bộ chuyến xe đang ACTIVE trong ngày mẫu
        LocalDateTime startOfDay = sourceDate.atStartOfDay();
        LocalDateTime endOfDay = sourceDate.atTime(23, 59, 59);
        List<Trip> sourceTrips = tripRepository.findByDepartureTimeBetweenAndStatus(startOfDay, endOfDay, "ACTIVE");

        if (sourceTrips.isEmpty()) {
            throw new RuntimeException("Ngày mẫu (" + sourceDate + ") không có chuyến xe nào đang hoạt động để nhân bản!");
        }

        // 2. Tạo danh sách chuyến mới cho các ngày mục tiêu
        for (LocalDate targetDate : targetDates) {
            for (Trip baseTrip : sourceTrips) {
                Trip newTrip = new Trip();
                newTrip.setRoute(baseTrip.getRoute());
                newTrip.setBus(baseTrip.getBus());
                newTrip.setPrice(baseTrip.getPrice());
                newTrip.setStatus("ACTIVE");
                newTrip.setBookedSeats(0);
                
                // Ghép ngày mới với giờ của chuyến cũ
                LocalDateTime newDep = LocalDateTime.of(targetDate, baseTrip.getDepartureTime().toLocalTime());
                LocalDateTime newArr = LocalDateTime.of(targetDate, baseTrip.getArrivalTime().toLocalTime());
                
                newTrip.setDepartureTime(newDep);
                newTrip.setArrivalTime(newArr);
                
                tripRepository.save(newTrip);
            }
        }
    }

    // 🌟 SỬA HÀM HỦY: Hủy trực tiếp 1 chuyến xe theo ID (Khớp với nút bấm Hủy trên giao diện)
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void cancelTripById(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyến xe!"));
        
        if ("CANCELLED".equals(trip.getStatus())) {
            throw new RuntimeException("Chuyến xe này đã bị hủy từ trước!");
        }

        trip.setStatus("CANCELLED");
        
        // Hoàn tiền và gửi Email cho khách đã đặt
        List<Booking> affectedBookings = bookingRepository.findByTripIdAndStatus(trip.getId(), "PAID");
        for (Booking booking : affectedBookings) {
            booking.setStatus("REFUNDING");
            
            String targetEmail = booking.getUser() != null ? booking.getUser().getEmail() : "khach@example.com";
            String passengerName = booking.getPassengerName() != null ? booking.getPassengerName() : "Quý khách";
            
            try {
                emailService.sendTripCancellationEmail(targetEmail, passengerName, trip);
            } catch (Exception e) {
                System.err.println("Không gửi được email cho: " + targetEmail);
            }
        }
        bookingRepository.saveAll(affectedBookings);
        tripRepository.save(trip);
    }
    // ========================================================
    // CÁC HÀM BỔ SUNG CHO TÍNH NĂNG TÁCH TAB VÀ HÀNH KHÁCH
    // ========================================================

    // 1. Lấy danh sách chuyến xe theo ngày cụ thể (Dùng chung cho cả Tab Mẫu và Tab Thực tế)
    @PreAuthorize("hasRole('ADMIN')")
    public List<TripResponse> getTripsByDateForAdmin(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        
        // Lấy tất cả trạng thái (kể cả đã hủy để Admin còn biết)
        List<Trip> trips = tripRepository.findByDepartureTimeBetweenAndStatus(startOfDay, endOfDay, "ACTIVE");
        List<Trip> cancelledTrips = tripRepository.findByDepartureTimeBetweenAndStatus(startOfDay, endOfDay, "CANCELLED");
        
        trips.addAll(cancelledTrips);
        
        // Dùng lại hàm convertToResponse đã có sẵn ở phần Public
        return trips.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    // 2. XÓA VĨNH VIỄN (Hard Delete) - Chỉ dùng cho chuyến mẫu
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteTemplateTrip(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyến xe mẫu!"));
        
        // Đảm bảo an toàn: Chỉ cho xóa nếu chưa có ai đặt vé
        List<Booking> bookings = bookingRepository.findByTripIdAndStatus(tripId, "PAID");
        if (!bookings.isEmpty()) {
            throw new RuntimeException("Không thể xóa vĩnh viễn! Chuyến xe này đã có khách đặt vé.");
        }
        
        tripRepository.delete(trip);
    }

    // 3. Lấy danh sách Hành khách đã thanh toán của 1 chuyến xe
   // 3. Lấy danh sách Hành khách đã thanh toán của 1 chuyến xe
   @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> getPassengersByTripId(Long tripId) {
        List<Booking> bookings = bookingRepository.findByTripIdAndStatus(tripId, "PAID");
        
        return bookings.stream().map(b -> {
            Map<String, Object> passengerInfo = new java.util.HashMap<>();
            passengerInfo.put("bookingCode", b.getId()); 
            passengerInfo.put("passengerName", b.getPassengerName());
            passengerInfo.put("phone", b.getPassengerPhone()); 
            // 🌟 BỎ EMAIL, THÊM TOTAL TICKETS
            passengerInfo.put("totalTickets", b.getTotalTickets()); 
            passengerInfo.put("pickupLocation", b.getPickupLocation());
            passengerInfo.put("dropoffLocation", b.getDropoffLocation());
            passengerInfo.put("note", b.getNote());
            passengerInfo.put("totalPrice", b.getTotalAmount()); 
            
            return passengerInfo;
        }).collect(Collectors.toList());
    }
}