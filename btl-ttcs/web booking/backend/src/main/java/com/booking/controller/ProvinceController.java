package com.booking.controller;

import com.booking.dto.response.ProvinceResponse;
import com.booking.service.ProvinceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/provinces")
@CrossOrigin(origins = "*") // Mở khóa CORS cho Frontend gọi
public class ProvinceController {

    @Autowired
    private ProvinceService provinceService;

    // Lấy danh sách tất cả tỉnh thành
    @GetMapping
    public List<ProvinceResponse> getAllProvinces() {
        return provinceService.getAllProvinces();
    }
}