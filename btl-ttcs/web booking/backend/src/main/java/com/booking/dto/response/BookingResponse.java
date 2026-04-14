package com.booking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    
    // ⚠️ ĐÃ SỬA LỖI: ID phải là String để khớp với VARCHAR(50) trong Database
    private String id; 
    
    private String passengerName;
    private String passengerPhone;
    private String tripRoute;         
    private LocalDateTime departureTime; 
    
    private Integer totalTickets;     // Đã đổi tên
    private Double totalAmount;       // Đã đổi tên (Thay cho totalPrice)
    private String status;            
    private LocalDateTime bookingTime;// Đã đổi tên (Thay cho bookingDate)
}