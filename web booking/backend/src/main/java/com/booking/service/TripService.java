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

        // 1. Xử lý lỗi dòng 28: Ép kiểu BigDecimal trong DB sang Double cho Frontend
        if (trip.getPrice() != null) {
            response.setPrice(trip.getPrice().doubleValue());
        }

        // 2. Xử lý lỗi dòng 33-37: Lấy tên tỉnh thông qua Bến xe (Station)
        if (trip.getRoute() != null) {
            // Lấy Tỉnh đi
            if (trip.getRoute().getStartStation() != null && trip.getRoute().getStartStation().getProvince() != null) {
                response.setStartProvinceName(trip.getRoute().getStartStation().getProvince().getName());
            }
            // Lấy Tỉnh đến
            if (trip.getRoute().getEndStation() != null && trip.getRoute().getEndStation().getProvince() != null) {
                response.setEndProvinceName(trip.getRoute().getEndStation().getProvince().getName());
            }
        }
        
        // 3. Lấy Biển số và Loại xe từ Bus (Xe khách)
        if (trip.getBus() != null) {
            response.setLicensePlate(trip.getBus().getLicensePlate());
            if (trip.getBus().getBusType() != null) {
                response.setBusTypeName(trip.getBus().getBusType().getName());
            }
        }
        
        return response;
    }
}