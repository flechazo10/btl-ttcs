package com.booking.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class TripRequest {
    private Long routeId;          // ID của tuyến đường (VD: Hà Nội - Thanh Hóa)
    private Long busId;            // ID của xe khách (VD: Xe 36B-123.45)
    private LocalDateTime departureTime; // Thời gian khởi hành
    private Double price;          // Giá vé cho chuyến này
}