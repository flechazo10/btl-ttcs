package com.booking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor  // THÊM DÒNG NÀY
public class BookingHistoryDTO {
    private String bookingId;
    private String routeName;      // Ví dụ: Hà Nội - Hồ Chí Minh
    private LocalDateTime departureTime; 
    private Integer totalTickets;
    private BigDecimal totalAmount;
    private String status;
}