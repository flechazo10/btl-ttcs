package com.booking.service;

import com.booking.dto.response.ProvinceResponse;
import com.booking.entity.Province;
import com.booking.repository.ProvinceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProvinceService {

    @Autowired
    private ProvinceRepository provinceRepository;

    public List<ProvinceResponse> getAllProvinces() {
        List<Province> provinces = provinceRepository.findAll();
        // Chuyển đổi sang Response mới
        return provinces.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    private ProvinceResponse convertToResponse(Province province) {
        ProvinceResponse response = new ProvinceResponse();
        response.setId(province.getId());
        response.setName(province.getName());
        return response;
    }
}