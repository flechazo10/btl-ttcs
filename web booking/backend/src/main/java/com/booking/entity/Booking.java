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

<<<<<<< HEAD
    @Column(name = "total_tickets")
    private Integer totalTickets = 1;

    // --- CỘT MỚI: Trạng thái đơn hàng (PENDING, PAID, CANCELLED) ---
    private String status = "PENDING"; 
=======
    // --- MỚI THÊM VÀO ĐÂY ---
    @Column(name = "total_tickets")
    private Integer totalTickets = 1;
>>>>>>> 081ce1dc46ec4448ba85e8bd6bb9c69d39cc27c6
}