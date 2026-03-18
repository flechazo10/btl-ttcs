package com.booking.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingRequest {
    
    // Frontend chỉ cần gửi ID của chuyến xe, không cần gửi nguyên cả một Object Trip
    private Long tripId; 
    
    // Thông tin khách điền trên Form HTML
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    
    // Số lượng ghế khách muốn đặt
    private Integer numberOfTickets;
    
    // Ghi chú thêm (nếu có)
    private String note;
}