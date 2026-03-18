package com.booking.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class BookingResponse {
    private Long id;
    private String customerName;
    private String customerPhone;
    private String tripRoute;         // Nối sẵn chuỗi "Hà Nội - Thanh Hóa" cho Frontend dễ in ra
    private LocalDateTime departureTime; 
    private Integer numberOfTickets;  // Số lượng vé
    private Double totalPrice;        // Tổng tiền (Backend tự tính và trả về)
    private String status;            // Đã thanh toán, Chờ thanh toán, Đã hủy
    private LocalDateTime bookingDate;// Ngày thực hiện đặt vé
}