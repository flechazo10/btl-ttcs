package com.booking.service;

import com.booking.entity.Route;
import com.booking.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RouteService {

    @Autowired
    private RouteRepository routeRepository;

    // Lấy danh sách tuyến đường cho Dropdown của Admin
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> getAllRoutesForAdmin() {
        List<Route> routes = routeRepository.findAll();
        
        return routes.stream().map(r -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", r.getId());
            // Trích xuất tên Bến xe đi và Bến xe đến
            map.put("startStationName", r.getStartStation() != null ? r.getStartStation().getName() : "N/A");
            map.put("endStationName", r.getEndStation() != null ? r.getEndStation().getName() : "N/A");
            return map;
        }).collect(Collectors.toList());
    }
}