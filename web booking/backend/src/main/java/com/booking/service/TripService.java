package com.booking.service;

import com.booking.dto.response.TripResponse;
import com.booking.entity.Trip;
import com.booking.repository.TripRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripService {

    @Autowired
    private TripRepository tripRepository;

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

        // 1. Xử lý giá tiền
        if (trip.getPrice() != null) {
            response.setPrice(trip.getPrice().doubleValue());
        }

        // 2. Lấy tên Tỉnh
        if (trip.getRoute() != null) {
            if (trip.getRoute().getStartStation() != null && trip.getRoute().getStartStation().getProvince() != null) {
                response.setStartProvinceName(trip.getRoute().getStartStation().getProvince().getName());
            }
            if (trip.getRoute().getEndStation() != null && trip.getRoute().getEndStation().getProvince() != null) {
                response.setEndProvinceName(trip.getRoute().getEndStation().getProvince().getName());
            }
        }
        
        // 3. Lấy Biển số, Loại xe và TÍNH TOÁN SỐ GHẾ TRỐNG
        int total = 0;
        if (trip.getBus() != null) {
            response.setLicensePlate(trip.getBus().getLicensePlate());
            if (trip.getBus().getBusType() != null) {
                response.setBusTypeName(trip.getBus().getBusType().getName());
                // Lấy tổng số ghế từ bảng BusType
                total = trip.getBus().getBusType().getTotalSeats();
            }
        }
        
        // Lấy số ghế đã đặt (Nếu bị null ở DB thì mặc định là 0)
        int booked = (trip.getBookedSeats() != null) ? trip.getBookedSeats() : 0;
        
        // Gắn vào Response gửi về cho Frontend
        response.setTotalSeats(total);
        response.setBookedSeats(booked);
        response.setAvailableSeats(total - booked); // Phép tính quan trọng nhất!
        
        return response;
    }
}