package com.booking.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class TripResponse {
    private Long id;
    private String startProvinceName; // Tên tỉnh đi (VD: Hà Nội)
    private String endProvinceName;   // Tên tỉnh đến (VD: Thanh Hóa)
    private String startStationName;  // Bến xe xuất phát (VD: Bến xe Mỹ Đình)
    private String endStationName;    // Bến xe đích đến (VD: Bến xe Phía Nam)
    private String licensePlate;      // Biển số xe khách (VD: 36B-123.45)
    private String busTypeName;       // Loại xe (VD: Limousine 24 phòng)
    private LocalDateTime departureTime; // Thời gian đi
    private LocalDateTime arrivalTime;   // Thời gian đến
    private Double price;             // Giá vé
    private String status;            // Trạng thái (Còn vé, Hết vé)
    private Integer totalSeats;      // Tổng số ghế của loại xe
    private Integer bookedSeats;     // Số ghế đã bị đặt
    private Integer availableSeats;  // Số ghế còn trống (Tính toán = Tổng - Đã đặt)
}