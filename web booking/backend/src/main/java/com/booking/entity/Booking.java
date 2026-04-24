package com.booking.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking")
@Data
public class Booking {

    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // --- 🌟 THAY ĐỔI: Thêm liên kết với Trip ---
    @ManyToOne
    @JoinColumn(name = "trip_id")
    private Trip trip;

    @Column(name = "passenger_name")
    private String passengerName;

    @Column(name = "passenger_phone")
    private String passengerPhone;

    private String note;

    @Column(name = "pickup_location")
    private String pickupLocation;

    @Column(name = "dropoff_location")
    private String dropoffLocation;

    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "booking_time")
    private LocalDateTime bookingTime;

    @Column(name = "total_tickets")
    private Integer totalTickets = 1;

    private String status = "PENDING"; 
}