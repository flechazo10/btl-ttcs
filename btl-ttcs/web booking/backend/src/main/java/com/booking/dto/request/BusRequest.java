package com.booking.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BusRequest {
    private String licensePlate;   // Biển số xe
    private Long busTypeId;        // ID của loại xe (VD: Xe giường nằm 34 chỗ)
}