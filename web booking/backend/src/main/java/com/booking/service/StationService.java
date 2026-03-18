package com.booking.service;

import com.booking.dto.response.StationResponse;
import com.booking.entity.Station;
import com.booking.repository.StationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StationService {

    @Autowired
    private StationRepository stationRepository;

    public List<StationResponse> getAllStations() {
        List<Station> stations = stationRepository.findAll();
        return stations.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    private StationResponse convertToResponse(Station station) {
        StationResponse response = new StationResponse();
        response.setId(station.getId());
        response.setName(station.getName());
        response.setAddress(station.getAddress());
        
        if (station.getProvince() != null) {
            response.setProvinceName(station.getProvince().getName());
        }
        return response;
    }
}