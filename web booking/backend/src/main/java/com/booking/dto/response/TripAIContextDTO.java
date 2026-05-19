package com.booking.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TripAIContextDTO {
    private String startProvince;
    private String startStation;
    private String endProvince;
    private String endStation;
    private LocalDateTime departureTime;
    private LocalDateTime arrivalTime;
    private BigDecimal price;
    private Integer totalSeats;
    private Integer bookedSeats;

    // Constructor bắt buộc phải khớp với thứ tự trong câu lệnh SQL
    public TripAIContextDTO(String startProvince, String startStation, String endProvince, String endStation, 
                            LocalDateTime departureTime, LocalDateTime arrivalTime, BigDecimal price, 
                            Integer totalSeats, Integer bookedSeats) {
        this.startProvince = startProvince;
        this.startStation = startStation;
        this.endProvince = endProvince;
        this.endStation = endStation;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.price = price;
        this.totalSeats = totalSeats != null ? totalSeats : 40; // Mặc định 40 nếu null
        this.bookedSeats = bookedSeats != null ? bookedSeats : 0;
    }

    // Các hàm Getter để ChatService lấy dữ liệu
    public String getStartProvince() { return startProvince; }
    public String getStartStation() { return startStation; }
    public String getEndProvince() { return endProvince; }
    public String getEndStation() { return endStation; }
    public LocalDateTime getDepartureTime() { return departureTime; }
    public LocalDateTime getArrivalTime() { return arrivalTime; }
    public BigDecimal getPrice() { return price; }
    
    // Tự động tính số ghế trống
    public Integer getAvailableSeats() { 
        return totalSeats - bookedSeats; 
    }
}