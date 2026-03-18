package com.booking.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RouteRequest {
    private Long startProvinceId;  // ID của tỉnh xuất phát
    private Long endProvinceId;    // ID của tỉnh đích đến
    private Double distance;       // Khoảng cách (km)
    private Integer estimatedHours; // Thời gian di chuyển dự kiến (giờ)
}