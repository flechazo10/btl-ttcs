package com.booking.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {
    private Long userId; // Thêm trường này để nhận ID người dùng từ Frontend
    
    private Long tripId; 
    
    // Đồng bộ tên biến với Entity cho dễ map dữ liệu
    private String passengerName;
    private String passengerPhone;    
    // --- ĐÃ ĐỔI TÊN & THÊM MỚI ---
    private Integer totalTickets; 
    
    private String pickupLocation;  // Điểm đón (VD: Bến xe Nước Ngầm)
    private String dropoffLocation; // Điểm trả (VD: Bến xe phía Bắc)
    
    private String note;
}