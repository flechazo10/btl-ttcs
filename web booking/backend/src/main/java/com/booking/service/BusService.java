package com.booking.service;

import com.booking.entity.Bus;
import com.booking.repository.BusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BusService {

    @Autowired
    private BusRepository busRepository;

    // Lấy danh sách xe đang hoạt động cho Dropdown của Admin
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> getAllActiveBusesForAdmin() {
        // Bạn có thể dùng findAll(), nhưng để logic chuẩn thì chỉ nên lấy xe có status là ACTIVE
        List<Bus> buses = busRepository.findAll(); 
        
        return buses.stream()
            .filter(b -> "ACTIVE".equals(b.getStatus())) // Chỉ hiển thị xe đang hoạt động
            .map(b -> {
                Map<String, Object> map = new HashMap<>();
                map.put("id", b.getId());
                map.put("licensePlate", b.getLicensePlate());
                map.put("busTypeName", b.getBusType() != null ? b.getBusType().getName() : "N/A");
                return map;
        }).collect(Collectors.toList());
    }
}